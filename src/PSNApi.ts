import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import { UserProfile } from './types/UserProfile';
import { Profiles } from './types/Friends';
import { DomainResponse } from './types/Search';
import { Root, CreatedGroup, MessagingConfig, ResourceType, Group } from './types/Group';
import { Token, Tokens } from './types/Token';

const PSN_API_CONFIG = path.join(process.cwd(), 'data', 'psn_tokens.json');
const FRIEND_BASE_URL = 'https://us-prof.np.community.playstation.net/userProfile';
const FRIEND_FIELDS = 'npId,onlineId,accountId,avatarUrls,plus,aboutMe,languagesUsed,trophySummary(@default,level,progress,earnedTrophies),isOfficiallyVerified,personalDetail(@default,profilePictureUrls),personalDetailSharing,personalDetailSharingRequestMessageFlag,primaryOnlineStatus,presences(@default,@titleInfo,platform,lastOnlineDate,hasBroadcastData),requestMessageFlag,blocking,friendRelation,following,consoleAvailability';
const SEARCH_BASE_URL = 'https://m.np.playstation.com/api/search';
const MESSAGING_BASE_URL = 'https://m.np.playstation.com/api/gamingLoungeGroups';

interface Config {
  URL: string;
  Method?: string;
  ContentType?: string;
  Headers?: Record<string, string>;
}

export class PSNApi {
  private Npsso: string;
  private ClientId: string;
  private ClientSecret: string;
  private Tokens: Tokens;

  constructor(npsso: string, clientId: string, clientSecret: string = '') {
    this.Npsso = npsso;
    this.ClientId = clientId;
    this.ClientSecret = clientSecret;
    this.Tokens = { Access: { Token: '', ExpiresIn: 0 }, Refresh: { Token: '', ExpiresIn: 0 } };
    this.LoadTokens();
  }

  /**
   * Update the NPSSO token
   */
  setNPSSO(npsso: string): void {
    this.Npsso = npsso;
  }

  /**
   * Get the current NPSSO token
   */
  getNPSSO(): string {
    return this.Npsso;
  }

  async GetAccessToken(): Promise<[boolean, Tokens]> {
    if (await fs.pathExists(PSN_API_CONFIG)) {
      try {
        this.LoadTokens();
        if (await this.CheckAndRefreshToken()) {
          return [true, this.Tokens];
        }
      } catch (ex: any) {
        console.error(`Failed to load tokens: ${ex.message}`);
        return [false, this.Tokens];
      }
    }

    const formData = `grant_type=sso_token&token_format=jwt&access_type=offline&client_id=${this.ClientId}&client_secret=${this.ClientSecret}&npsso=${this.Npsso}&scope=psn%3Amobile.v2.core psn%3Aclientapp`;

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const uri = 'https://ca.account.sony.com/api/authz/v3/oauth/token';

    try {
      const response = await axios.post(uri, formData, { headers });
      
      if (response.data && response.data.access_token) {
        this.Tokens.Access.Token = response.data.access_token;
        this.Tokens.Access.ExpiresIn = response.data.expires_in;
        this.Tokens.Refresh.Token = response.data.refresh_token;
        this.Tokens.Refresh.ExpiresIn = response.data.refresh_token_expires_in;
        this.SaveTokens();
        return [true, this.Tokens];
      } else {
        console.error(`Failed to get access token: ${JSON.stringify(response.data)}`);
        return [false, this.Tokens];
      }
    } catch (error: any) {
      console.error(`Failed to get access token: ${error.message}`);
      return [false, this.Tokens];
    }
  }

  async GetProfile(name: string = ''): Promise<[boolean, UserProfile]> {
    if (!this.HasAccessToken()) {
      return [false, {} as UserProfile];
    }

    const profilePath = `/v1/users/${name ? name : 'me'}/profile2?fields=${FRIEND_FIELDS}`;
    const [success, response] = await this.Call(
      { URL: `${FRIEND_BASE_URL}${profilePath}`, Method: 'GET', ContentType: 'application/json' },
      this.Tokens.Access
    );

    if (!success || !response || !response.profile) {
      console.error(`Failed to get profile: ${JSON.stringify(response)}`);
      return [false, {} as UserProfile];
    }

    return [true, response as UserProfile];
  }

  async GetFriends(): Promise<[boolean, Profiles]> {
    if (!this.HasAccessToken()) {
      return [false, {} as Profiles];
    }

    const path = `/v1/users/me/friends/profiles2?fields=${FRIEND_FIELDS}`;
    const [success, response] = await this.Call(
      { URL: `${FRIEND_BASE_URL}${path}`, Method: 'GET', ContentType: 'application/json' },
      this.Tokens.Access
    );

    try {
      if (!success || !response || !response.profiles) {
        console.error(`Failed to get friends: ${JSON.stringify(response)}`);
        return [false, {} as Profiles];
      }
      return [true, response as Profiles];
    } catch (e: any) {
      console.error(`Failed to parse friends: ${e.message}`);
    }

    return [false, {} as Profiles];
  }

  async DeleteFriend(name: string): Promise<boolean> {
    if (!this.HasAccessToken()) {
      return false;
    }

    const [res, profile] = await this.GetProfile();
    if (!res) {
      console.error('Failed to get own profile');
      return false;
    }

    const path = `/v1/users/${profile.profile.onlineId}/friendList/${name}`;
    const [success] = await this.Call(
      { URL: `${FRIEND_BASE_URL}${path}`, Method: 'DELETE', ContentType: 'application/json' },
      this.Tokens.Access
    );

    return success;
  }

  async UniversalSearch(name: string, domain: string = 'SocialAllAccounts'): Promise<[boolean, DomainResponse]> {
    if (!this.HasAccessToken()) {
      return [false, {} as DomainResponse];
    }

    const path = `/v1/universalSearch`;
    const formData = JSON.stringify({ searchTerm: name, domainRequests: [{ domain }] });

    const [success, response] = await this.Call(
      { URL: `${SEARCH_BASE_URL}${path}`, Method: 'POST', ContentType: 'application/json' },
      this.Tokens.Access,
      formData
    );

    try {
      if (!success || !response || !response.domainResponses) {
        console.error(`Failed to universal search: ${JSON.stringify(response)}`);
        return [false, {} as DomainResponse];
      }
      const domainResponse = response.domainResponses[0] as DomainResponse;
      return [true, domainResponse];
    } catch (e: any) {
      console.error(`Failed to parse universal search: ${e.message}`);
    }

    return [false, {} as DomainResponse];
  }

  async CreateGroup(invites: string[]): Promise<[boolean, CreatedGroup]> {
    if (!this.HasAccessToken()) {
      return [false, {} as CreatedGroup];
    }

    const payload = {
      invitees: invites.map(accountId => ({ accountId }))
    };

    const path = `/v1/groups`;
    const [success, response] = await this.Call(
      { URL: `${MESSAGING_BASE_URL}${path}`, Method: 'POST', ContentType: 'application/json' },
      this.Tokens.Access,
      JSON.stringify(payload)
    );

    if (success && response && response.groupId) {
      return [true, response as CreatedGroup];
    }

    return [false, {} as CreatedGroup];
  }

  async GetGroups(): Promise<[boolean, Root]> {
    if (!this.HasAccessToken()) {
      return [false, {} as Root];
    }

    const headers = {
      'Accept-Language': 'en-US'
    };

    const path = `/v1/members/me/groups?favoriteFilter=notFavorite&includeFields=groupName,groupIcon,members,mainThread,joinedTimestamp,modifiedTimestamp,totalGroupCount,isFavorite,existsNewArrival,partySessions&limit=200`;
    const [success, response] = await this.Call(
      { URL: `${MESSAGING_BASE_URL}${path}`, Method: 'GET', ContentType: 'application/json', Headers: headers },
      this.Tokens.Access
    );

    try {
      if (!success || !response || !response.groups) {
        console.error(`Failed to get groups: ${JSON.stringify(response)}`);
        return [false, {} as Root];
      }
      return [true, response as Root];
    } catch (e: any) {
      console.error(`Failed to parse groups: ${e.message}`);
    }

    return [false, {} as Root];
  }

  async GetMessages(groupId: string, threadId?: string): Promise<[boolean, any]> {
    if (!this.HasAccessToken()) {
      return [false, null];
    }

    const headers = {
      'Accept-Language': 'en-US'
    };

    const effectiveThreadId = threadId || groupId;
    const path = `/v1/members/me/groups/${groupId}/threads/${effectiveThreadId}/messages`;
    //console.log(`Fetching messages from: ${MESSAGING_BASE_URL}${path}`);
    const [success, response] = await this.Call(
      { URL: `${MESSAGING_BASE_URL}${path}`, Method: 'GET', ContentType: 'application/json', Headers: headers },
      this.Tokens.Access
    );

    if (!success) {
      console.error(`Failed to get messages. Success: ${success}, Response:`, response);
      return [false, response];
    }

    // console.log(response.messages)
    // response.messages?.forEach((msg: any) => {
    //   if (msg.messageDetail) {
    //     console.log('messageDetail for messageUid', msg.messageUid, ':', msg.messageDetail);
    //   }
    // });

    return [true, response];
  }

  async GetFirstGroupMessages(): Promise<[boolean, any, Group | null]> {
    if (!this.HasAccessToken()) {
      return [false, null, null];
    }

    const [success, groupsData] = await this.GetGroups();
    if (!success || !groupsData || !groupsData.groups || groupsData.groups.length === 0) {
      console.error('No groups available');
      return [false, null, null];
    }

    const firstGroup = groupsData.groups[0];
    if (!firstGroup.mainThread || !firstGroup.mainThread.threadId) {
      console.error('First group does not have a valid thread');
      return [false, null, firstGroup];
    }

    const [messagesSuccess, messages] = await this.GetMessages(
      firstGroup.groupId,
      firstGroup.mainThread.threadId
    );

    if (!messagesSuccess) {
      return [false, null, firstGroup];
    }

    return [true, messages, firstGroup];
  }

  async SendMessage(config: MessagingConfig, message: string): Promise<boolean> {
    if (!this.HasAccessToken()) {
      return false;
    }

    if (!config.threadId) {
      config.threadId = config.groupId;
    }

    const payload = {
      messageType: 1,
      body: message
    };

    const path = `/v1/groups/${config.groupId}/threads/${config.threadId}/messages`;
    const [success] = await this.Call(
      { URL: `${MESSAGING_BASE_URL}${path}`, Method: 'POST', ContentType: 'application/json' },
      this.Tokens.Access,
      JSON.stringify(payload)
    );

    return success;
  }

  async AddResourceToGroup(config: MessagingConfig, filePath: string): Promise<[boolean, string]> {
    if (!this.HasAccessToken()) {
      return [false, ''];
    }

    let file = filePath;
    const isLink = /^https?:\/\/\S+?\.(?:png|jpe?g)$/i.test(filePath);

    if (isLink) {
      const tempPath = path.join(process.cwd(), 'data', 'psnapi', 'resources', 'temp.dat');
      await fs.ensureDir(path.dirname(tempPath));
      
      try {
        const response = await axios.get(filePath, { responseType: 'arraybuffer' });
        await fs.writeFile(tempPath, response.data);
        file = tempPath;
      } catch (error: any) {
        console.error(`Failed to download file: ${filePath}`, error.message);
        return [false, ''];
      }
    }

    try {
      const fileBuffer = await fs.readFile(file);
      const urlPath = `/v1/groups/${config.groupId}/resources`;
      
      const [success, response] = await this.Call(
        { URL: `${MESSAGING_BASE_URL}${urlPath}`, Method: 'POST', ContentType: 'image/jpeg' },
        this.Tokens.Access,
        fileBuffer
      );

      if (isLink) {
        await fs.remove(file);
      }

      if (success && response && response.resourceId) {
        return [true, response.resourceId];
      }

      console.error(`Failed to add resource to group: ${JSON.stringify(response)}`);
      return [false, ''];
    } catch (error: any) {
      console.error(`Failed to add resource: ${error.message}`);
      return [false, ''];
    }
  }

  async GetResource(groupId: string, resourceId: string): Promise<[boolean, Buffer | null, string | null]> {
    if (!this.HasAccessToken()) {
      return [false, null, null];
    }

    try {
      const urlPath = `/v1/groups/${groupId}/resources/${resourceId}`;
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${this.Tokens.Access.Token}`,
        'Accept': '*/*'
      };

      const axiosConfig: AxiosRequestConfig = {
        method: 'GET',
        url: `${MESSAGING_BASE_URL}${urlPath}`,
        headers,
        responseType: 'arraybuffer'
      };

      const response: AxiosResponse = await axios(axiosConfig);
      
      // Determine content type from response headers or default to image/jpeg
      const contentType = response.headers['content-type'] || 'image/jpeg';
      const buffer = Buffer.from(response.data);
      
      return [true, buffer, contentType];
    } catch (error: any) {
      console.error(`Failed to get resource: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Response: ${JSON.stringify(error.response.data)}`);
      }
      return [false, null, null];
    }
  }

  async SendResourceImpl(config: MessagingConfig, resourceId: string, type: ResourceType): Promise<boolean> {
    if (!config.threadId) {
      config.threadId = config.groupId;
    }

    switch (type) {
      case ResourceType.Image:
        return this.SendImageImpl(config, resourceId);
      case ResourceType.Sticker:
        return this.SendStickerImpl(config, resourceId);
      default:
        break;
    }

    return false;
  }

  private async SendImageImpl(config: MessagingConfig, resourceId: string): Promise<boolean> {
    if (!this.HasAccessToken()) {
      return false;
    }

    const payload = {
      messageType: 3,
      messageDetail: {
        imageMessageDetail: {
          resourceId
        }
      }
    };

    const path = `/v1/groups/${config.groupId}/threads/${config.threadId}/messages`;
    const [success] = await this.Call(
      { URL: `${MESSAGING_BASE_URL}${path}`, Method: 'POST', ContentType: 'application/json; charset=utf-8' },
      this.Tokens.Access,
      JSON.stringify(payload)
    );

    return success;
  }

  private async SendStickerImpl(config: MessagingConfig, resourceId: string): Promise<boolean> {
    if (!this.HasAccessToken()) {
      return false;
    }

    const payload = {
      messageType: 1013,
      messageDetail: {
        stickerMessageDetail: {
          imageUrl: resourceId,
          manifestFileUrl: 'https://psn-rsc.prod.dl.playstation.net/psn-rsc/sticker/preset/PRESET0000000002_514DB3A4FB993D12EBF3/manifest.json',
          number: '03',
          packageId: 'PRESET0000000002',
          type: 'preset'
        }
      }
    };

    const path = `/v1/groups/${config.groupId}/threads/${config.threadId}/messages`;
    const [success] = await this.Call(
      { URL: `${MESSAGING_BASE_URL}${path}`, Method: 'POST', ContentType: 'application/json' },
      this.Tokens.Access,
      JSON.stringify(payload)
    );

    return success;
  }

  private async RefreshAccessToken(): Promise<[boolean, Token, Token]> {
    if (!this.HasAccessToken()) {
      return [false, {} as Token, {} as Token];
    }

    const formData = `refresh_token=${this.Tokens.Refresh.Token}&grant_type=refresh_token&token_format=jwt&scope=psn:mobile.v2.core psn:clientapp`;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    const uri = 'https://ca.account.sony.com/api/authz/v3/oauth/token';

    try {
      const response = await axios.post(uri, formData, { headers });
      
      if (response.data && response.data.access_token) {
        const accessToken: Token = {
          Token: response.data.access_token,
          ExpiresIn: response.data.expires_in
        };
        const refreshToken: Token = {
          Token: response.data.refresh_token,
          ExpiresIn: response.data.refresh_token_expires_in
        };
        return [true, accessToken, refreshToken];
      }
    } catch (e: any) {
      console.error(`Failed to parse refresh token response: ${e.message}`);
    }

    return [false, {} as Token, {} as Token];
  }

  private HasAccessToken(): boolean {
    return !!this.Tokens.Access.Token;
  }

  private async Call(config: Config, token: Token, formData?: string | Buffer): Promise<[boolean, any]> {
    if (!this.HasAccessToken()) {
      return [false, null];
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token.Token}`,
      'Content-Type': config.ContentType || 'application/json'
    };

    if (config.Headers) {
      Object.assign(headers, config.Headers);
    }

    const axiosConfig: AxiosRequestConfig = {
      method: config.Method || 'GET',
      url: config.URL,
      headers,
      data: formData,
      responseType: formData instanceof Buffer ? 'json' : 'json'
    };

    try {
      const response: AxiosResponse = await axios(axiosConfig);
      return [true, response.data];
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(`API call failed: ${error.message}`);
        console.error(`Status: ${error.response.status}`);
        console.error(`URL: ${config.URL}`);
        console.error(`Response data:`, JSON.stringify(error.response.data));
        return [false, error.response.data];
      } else if (error.request) {
        // The request was made but no response was received
        console.error(`API call failed: No response received`);
        console.error(`URL: ${config.URL}`);
        return [false, null];
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error(`API call failed: ${error.message}`);
        console.error(`URL: ${config.URL}`);
        return [false, null];
      }
    }
  }

  private async CheckAndRefreshToken(): Promise<boolean> {
    if (!(await fs.pathExists(PSN_API_CONFIG))) {
      return false;
    }

    const stats = await fs.stat(PSN_API_CONFIG);
    const currentTime = Date.now();
    const lastWriteTime = stats.mtimeMs;
    const expireTime = lastWriteTime + (this.Tokens.Access.ExpiresIn * 1000);

    if (currentTime <= expireTime) {
      console.log('Access token is still valid');
      return true;
    }

    const [success, access, refresh] = await this.RefreshAccessToken();
    if (!success) {
      console.error('Failed to refresh access token');
      return false;
    }

    this.Tokens.Access = access;
    this.Tokens.Refresh = refresh;
    console.log('Access token refreshed');
    this.SaveTokens();

    return true;
  }

  private SaveTokens(): void {
    try {
      fs.ensureDirSync(path.dirname(PSN_API_CONFIG));
      fs.writeJsonSync(PSN_API_CONFIG, this.Tokens, { spaces: 2 });
    } catch (error: any) {
      console.error(`Failed to save tokens: ${error.message}`);
    }
  }

  private LoadTokens(): void {
    try {
      if (fs.existsSync(PSN_API_CONFIG)) {
        this.Tokens = fs.readJsonSync(PSN_API_CONFIG);
      }
    } catch (error: any) {
      console.error(`Failed to load tokens: ${error.message}`);
    }
  }
}

