export interface GroupIcon {
  status: number;
}

export interface GroupName {
  status: number;
  value: string;
}

export interface Sender {
  accountId: string;
  onlineId: string;
}

export interface LatestMessage {
  alternativeMessageType: number;
  body: string;
  createdTimestamp: string;
  messageType: number;
  messageUid: string;
  sender: Sender;
}

export interface MainThread {
  existsUnreadMessage: boolean;
  latestMessage: LatestMessage;
  modifiedTimestamp: string;
  threadId: string;
}

export interface Member {
  accountId: string;
  onlineId: string;
}

export interface Group {
  existsNewArrival: boolean;
  groupIcon: GroupIcon;
  groupId: string;
  groupName: GroupName;
  groupType: number;
  isFavorite: boolean;
  joinedTimestamp: string;
  mainThread: MainThread;
  members: Member[];
  modifiedTimestamp: string;
}

export interface Root {
  groups: Group[];
}

export interface CreatedGroup {
  groupId: string;
  hasAllAccountInvited: boolean;
  mainThread: MainThread;
}

export interface MessagingConfig {
  groupId: string;
  threadId: string;
}

export enum ResourceType {
  Image = 0,
  Sticker = 1,
  Video = 2,
  Audio = 3,
  Link = 4
}

