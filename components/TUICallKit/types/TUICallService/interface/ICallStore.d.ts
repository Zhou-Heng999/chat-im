import { CallStatus, CallRole, CallMediaType, VideoDisplayMode, VideoResolution, TDeviceList } from '../const/index';
import { IUserInfo } from './index';
export interface IToastInfo {
    text: string;
    type?: string;
}
export interface ICallStore {
    callStatus: CallStatus;
    callRole: CallRole;
    callMediaType: CallMediaType;
    localUserInfo: IUserInfo;
    remoteUserInfoList: Array<IUserInfo>;
    callerUserInfo: IUserInfo;
    isGroup: boolean;
    callDuration: string;
    callTips: string;
    toastInfo: IToastInfo;
    isMinimized: boolean;
    enableFloatWindow: boolean;
    bigScreenUserId: string;
    language: string;
    isClickable: boolean;
    showPermissionTip: boolean;
    deviceList: TDeviceList;
    groupID: string;
    roomID: number;
    displayMode: VideoDisplayMode;
    videoResolution: VideoResolution;
    pusher: any;
    player: any[];
    isEarPhone: boolean;
    showSelectUser: boolean;
}
