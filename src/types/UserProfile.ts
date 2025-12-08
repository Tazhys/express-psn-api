export interface AvatarUrl {
  avatarUrl: string;
  size: string;
}

export interface ConsoleAvailability {
  availabilityStatus: string;
}

export interface PersonalDetail {
  firstName: string;
  lastName: string;
}

export interface EarnedTrophies {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
}

export interface TrophySummary {
  earnedTrophies: EarnedTrophies;
  level: number;
  progress: number;
}

export interface Presence {
  hasBroadcastData: boolean;
  lastOnlineDate: string;
  onlineStatus: string;
}

export interface Profile {
  aboutMe: string;
  accountId: string;
  avatarUrls: AvatarUrl[];
  blocking: boolean;
  consoleAvailability: ConsoleAvailability;
  following: boolean;
  friendRelation: string;
  isOfficiallyVerified: boolean;
  languagesUsed: string[];
  npId: string;
  onlineId: string;
  personalDetail: PersonalDetail;
  personalDetailSharing: string;
  personalDetailSharingRequestMessageFlag: boolean;
  plus: number;
  presences: Presence[];
  primaryOnlineStatus: string;
  requestMessageFlag: boolean;
  trophySummary: TrophySummary;
}

export interface UserProfile {
  profile: Profile;
}

