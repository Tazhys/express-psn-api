export interface Highlights {
  firstName: string[];
  onlineId: string[];
}

export interface SocialMetadata {
  accountId: string;
  accountType: string;
  avatarUrl: string;
  country: string;
  firstName: string;
  highlights: Highlights;
  isOfficiallyVerified: boolean;
  isPsPlus: boolean;
  language: string;
  lastName: string;
  mutualFriendsCount: number;
  onlineId: string;
  profilePicUrl: string;
  relationshipState: string;
  verifiedUserName: string;
}

export interface Result {
  id: string;
  relevancyScore: number;
  score: number;
  socialMetadata: SocialMetadata;
  type: string;
}

export interface DomainResponse {
  domain: string;
  domainExpandedTitle: string;
  domainTitle: string;
  domainTitleHighlight: string[];
  domainTitleMessageId: string;
  next: string;
  results: Result[];
  totalResultCount: number;
  zeroState: boolean;
}

