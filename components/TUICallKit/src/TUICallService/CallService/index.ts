import { TUICore, TUILogin, TUIConstants, ExtensionInfo } from '@tencentcloud/tui-core';
import { 
  ITUICallService, 
  ICallParams, 
  IGroupCallParams, 
  IUserInfo, 
  ICallbackParam, 
  ISelfInfoParams, 
  IBellParams, 
  IInviteUserParams,
  IJoinInGroupCallParams,
  IInitParams,
} from '../interface/ICallService';
import {
  StoreName,
  CallStatus,
  CallMediaType,
  NAME,
  CALL_DATA_KEY,
  LanguageType,
  CallRole,
  LOG_LEVEL,
  VideoDisplayMode,
  VideoResolution,
  StatusChange,
  AudioCallIcon,
  VideoCallIcon,
  ErrorCode,
  ErrorMessage,
  AudioPlayBackDevice,
} from '../const/index';
// @ts-ignore
import { TUICallEngine, TUICallEvent } from 'tuicall-engine-webrtc';
import { CallTips, t } from '../locales/index';
import { checkLocalMP3FileExists } from '../utils/index';
import { BellContext } from './bellContext';
import { VALIDATE_PARAMS, avoidRepeatedCall, paramValidate } from '../utils/validate/index';
import { handleRepeatedCallError, handleNoDevicePermissionError, formatTime, formatTimeInverse } from '../utils/common-utils';
import { getMyProfile, getRemoteUserProfile, generateText, generateStatusChangeText, getGroupMemberList, getGroupProfile } from './utils';
import timer from '../utils/timer';
import { ITUIGlobal } from '../interface/ITUIGlobal';
import { ITUIStore } from '../interface/ITUIStore';
import TuiGlobal from '../TUIGlobal/tuiGlobal';
import TuiStore from '../TUIStore/tuiStore';
const TUIGlobal: ITUIGlobal = TuiGlobal.getInstance();
const TUIStore: ITUIStore = TuiStore.getInstance();
const version = '3.1.5';
const frameWork = 'vue2.6';
export { TUIGlobal, TUIStore };

export default class TUICallService implements ITUICallService {
  static instance: TUICallService;
  public _tuiCallEngine: any;
  private _tim: any = null;
  private _TUICore: any = null;
  private _timerId: number = -1;
  private _bellContext: any = null;
  constructor() {
    console.log(`${NAME.PREFIX}version: ${version}`);
    this._watchTUIStore();
    this._bellContext =  new BellContext();
    // 下面：TUICore注册事件，注册组件服务，注册界面拓展
    TUICore.registerEvent(TUIConstants.TUILogin.EVENT.LOGIN_STATE_CHANGED, TUIConstants.TUILogin.EVENT_SUB_KEY.USER_LOGIN_SUCCESS, this);
    TUICore.registerService(TUIConstants.TUICalling.SERVICE.NAME, this);
    TUICore.registerExtension(TUIConstants.TUIChat.EXTENSION.INPUT_MORE.EXT_ID, this);
  }
  static getInstance() {
    if (!TUICallService.instance) {
      TUICallService.instance = new TUICallService();
    }
    return TUICallService.instance;
  }
  @avoidRepeatedCall()
  @paramValidate(VALIDATE_PARAMS.init)
  public async init(params: IInitParams) {
    try {
      if (this._tuiCallEngine) return;
      // @ts-ignore
      let { userID, tim, userSig, sdkAppID, SDKAppID, isFromChat } = params;
      if (this._TUICore) {
        sdkAppID = this._TUICore.SDKAppID;
        tim = this._TUICore.tim;
      }
      this._tim = tim;
      console.log(`${NAME.PREFIX}init sdkAppId: ${sdkAppID || SDKAppID}, userId: ${userID}`);
      this._tuiCallEngine = TUICallEngine.createInstance({
        tim,
        SDKAppID: sdkAppID || SDKAppID, // 兼容传入 SDKAppID 的问题
        // @ts-ignore
        frameWork,
        callkitVersion: version,
        chat: isFromChat || false,
      });
      this._addListenTuiCallEngineEvent();
      TUIStore.update(StoreName.CALL, NAME.LOCAL_USER_INFO, { userId: userID });
      await this._tuiCallEngine.login({ userID, userSig, assetsPath: '' }); // web && mini
    } catch (error) {
      console.error(`${NAME.PREFIX}init failed, error: ${JSON.stringify(error)}.`);
      throw error;
    }
  }
  // component destroy
  public async destroyed() {
    try {
      const currentCallStatus = TUIStore.getData(StoreName.CALL, NAME.CALL_STATUS);
      if (currentCallStatus !== CallStatus.IDLE) {
        throw new Error(`please destroyed when status is idle, current status: ${currentCallStatus}`);
      }
      if (this._tuiCallEngine) {
        this._removeListenTuiCallEngineEvent();
        this._bellContext.destroy();
        this._unwatchTUIStore();
        await this._tuiCallEngine.destroyInstance();
        this._tuiCallEngine = null;
        this._bellContext = null;
      }
    } catch (error) {
      console.error(`${NAME.PREFIX}destroyed failed, error: ${JSON.stringify(error)}.`);
      throw error;
    }
  }
  // ===============================【通话操作】===============================
  @avoidRepeatedCall()
  @paramValidate(VALIDATE_PARAMS.call)
  public async call(callParams: ICallParams) {
    try {
      const { type, userID } = callParams;
      if (TUIStore.getData(StoreName.CALL, NAME.CALL_STATUS) !== CallStatus.IDLE) return;
      await this._updateCallStoreBeforeCall(type, [{ userId: userID }]);
      this._executeExternalBeforeCalling(); // 执行外部传入的 beforeCall 方法
      const response = await this._tuiCallEngine.call(callParams);
      await this._updateCallStoreAfterCall([userID], response);
    } catch (error: any) {
      this._handleCallError(error, 'call');
    }
  };
  @avoidRepeatedCall()
  @paramValidate(VALIDATE_PARAMS.groupCall)
  public async groupCall(groupCallParams: IGroupCallParams) {
    try {
      const { userIDList, type, groupID } = groupCallParams;
      if (TUIStore.getData(StoreName.CALL, NAME.CALL_STATUS) !== CallStatus.IDLE) return;
      const remoteUserInfoList = userIDList.map(userId => ({ userId }));
      await this._updateCallStoreBeforeCall(type, remoteUserInfoList, groupID);
      this._executeExternalBeforeCalling();
      const response = await this._tuiCallEngine.groupCall(groupCallParams);
      await this._updateCallStoreAfterCall(userIDList, response);
    } catch (error: any) {
      this._handleCallError(error, 'groupCall');
    }
  }
  @avoidRepeatedCall()
  @paramValidate(VALIDATE_PARAMS.inviteUser)
  public async inviteUser(params: IInviteUserParams) {
    try {
      const { userIDList } = params;
      let inviteUserInfoList = await getRemoteUserProfile(userIDList, this.getTim(), TUIStore);
      const remoteUserInfoList = TUIStore.getData(StoreName.CALL, NAME.REMOTE_USER_INFO_LIST);
      TUIStore.update(StoreName.CALL, NAME.REMOTE_USER_INFO_LIST, [...remoteUserInfoList, ...inviteUserInfoList]);
      this._tuiCallEngine && await this._tuiCallEngine.inviteUser(params);
    } catch (error: any) {
      console.error(`${NAME.PREFIX}inviteUser failed, error: ${JSON.stringify(error)}.`);
      this._resetCallStore();
      throw error;
    }
  }
  @avoidRepeatedCall()
  @paramValidate(VALIDATE_PARAMS.joinInGroupCall)
  public async joinInGroupCall(params: IJoinInGroupCallParams) {
    try {
      const updateStoreParams = {
        [NAME.CALL_ROLE]: CallRole.CALLEE,
        [NAME.IS_GROUP]: true,
        [NAME.CALL_STATUS]: CallStatus.CONNECTED,
        [NAME.CALL_MEDIA_TYPE]: params.type,
        [NAME.GROUP_ID]: params.groupID,
        [NAME.ROOM_ID]: params.roomID,
      };
      TUIStore.updateStore(updateStoreParams, StoreName.CALL);
      const response = await this._tuiCallEngine.joinInGroupCall(params);
      (params.type === CallMediaType.VIDEO) && await this.openCamera(NAME.LOCAL_VIDEO);
      TUIStore.update(StoreName.CALL, NAME.IS_CLICKABLE, true);
      this._startTimer();
      this._updateDeviceList();
      await this._tuiCallEngine.setVideoQuality(TUIStore.getData(StoreName.CALL, NAME.VIDEO_RESOLUTION));
      const localUserInfo = TUIStore.getData(StoreName.CALL, NAME.LOCAL_USER_INFO);
      TUIStore.update(StoreName.CALL, NAME.LOCAL_USER_INFO, { ...localUserInfo, isEnter: true });
      this._setLocalUserInfoAudioVideoAvailable(true, NAME.AUDIO);
    } catch (error) {
      console.error(`${NAME.PREFIX}joinInGroupCall failed, error: ${JSON.stringify(error)}.`);
      this._resetCallStore();
      throw error;
    }
  }
  // ===============================【其它对外接口】===============================
  public getTUICallEngineInstance(): any {
    return this?._tuiCallEngine || null;
  }
  public setLogLevel(level: LOG_LEVEL) {
    this?._tuiCallEngine?.setLogLevel(level);
  }
  @paramValidate(VALIDATE_PARAMS.setLanguage)
  public setLanguage(language: LanguageType) {
    if (language && Object.values(LanguageType).includes(language)) {
      TUIStore.update(StoreName.CALL, NAME.LANGUAGE, language);
    }
  }
  @paramValidate(VALIDATE_PARAMS.enableFloatWindow)
  public enableFloatWindow(enable: boolean) {
    TUIStore.update(StoreName.CALL, NAME.ENABLE_FLOAT_WINDOW, enable);
  }
  @paramValidate(VALIDATE_PARAMS.setSelfInfo)
  public async setSelfInfo(params: ISelfInfoParams) {
    const { nickName, avatar } = params;
    try {
      await this._tuiCallEngine.setSelfInfo({ nickName, avatar });
    } catch (error) {
      console.error(`${NAME.PREFIX}setSelfInfo failed, error: ${JSON.stringify(error)}.`);
    }
  }
  @paramValidate(VALIDATE_PARAMS.enableAIVoice)
  public async enableAIVoice(enable: boolean) {
    try {
      await this._tuiCallEngine.enableAIVoice(enable);
      console.log(`${NAME.PREFIX}enableAIVoice: ${enable}.`);
    } catch (error: any) {
      console.error(`${NAME.PREFIX}enableAIVoice failed, error: ${JSON.stringify(error)}.`);
      throw error;
    }
  }
  // 修改默认铃声：只支持本地铃声文件，不支持在线铃声文件；修改铃声修改的是被叫的铃声
  @paramValidate(VALIDATE_PARAMS.setCallingBell)
  public async setCallingBell(filePath?: string) {
    let isCheckFileExist: boolean = true;
    isCheckFileExist = await checkLocalMP3FileExists(filePath);
    if (!isCheckFileExist) {
      console.warn(`${NAME.PREFIX}setCallingBell failed, filePath: ${filePath}.`);
      return ;
    }
    const bellParams: IBellParams = { calleeBellFilePath: filePath };
    this._bellContext.setBellProperties(bellParams);
  }
  @paramValidate(VALIDATE_PARAMS.enableMuteMode)
  public async enableMuteMode(enable: boolean) {
    try {
      const bellParams: IBellParams = { isMuteBell: enable };
      this._bellContext.setBellProperties(bellParams);
      await this._bellContext.setBellMute(enable);
    } catch (error) {
      console.warn(`${NAME.PREFIX}enableMuteMode failed, error: ${JSON.stringify(error)}.`);
    }
  }
  // =============================【内部按钮操作方法】=============================
  @avoidRepeatedCall()
  public async accept() {
    try {
      TUIStore.update(StoreName.CALL, NAME.CALL_STATUS, CallStatus.CONNECTED);
      this._updateDeviceList();
      const response = await this._tuiCallEngine.accept();
      if (response) {
        this._callTUIService({ message: response?.data?.message });
        TUIStore.update(StoreName.CALL, NAME.IS_CLICKABLE, true);
        this._startTimer();
        const callMediaType = TUIStore.getData(StoreName.CALL, NAME.CALL_MEDIA_TYPE);
        (callMediaType === CallMediaType.VIDEO) && await this.openCamera(NAME.LOCAL_VIDEO);
        await this._tuiCallEngine.setVideoQuality(TUIStore.getData(StoreName.CALL, NAME.VIDEO_RESOLUTION));
        const localUserInfo = TUIStore.getData(StoreName.CALL, NAME.LOCAL_USER_INFO);
        TUIStore.update(StoreName.CALL, NAME.LOCAL_USER_INFO, { ...localUserInfo, isEnter: true });
        this._setLocalUserInfoAudioVideoAvailable(true, NAME.AUDIO); // web && mini default open audio
      }
    } catch (error) {
      if (handleRepeatedCallError(error)) return;
      this._noDevicePermissionToast(error, CallMediaType.AUDIO);
      this._resetCallStore();
    }
  }
  @avoidRepeatedCall()
  public async hangup() {
    try {
      const response = await this._tuiCallEngine.hangup();
      response?.forEach((item) => {
        if (item?.code === 0) {
          this._callTUIService({ message: item?.data?.message });
        }
      });
    } catch (error) {
      console.debug(error);
    }
    this._resetCallStore();
  }
  @avoidRepeatedCall()
  public async reject() {
    try {
      const response = await this._tuiCallEngine.reject();
      if (response?.code === 0) {
        this._callTUIService({ message: response?.data?.message });
      }
    } catch (error) {
      console.debug(error);
    }
    this._resetCallStore();
  }
  @avoidRepeatedCall()
  public async openCamera(videoViewDomID: string) {
    try {
      await this._tuiCallEngine.openCamera(videoViewDomID);
      this._setLocalUserInfoAudioVideoAvailable(true, NAME.VIDEO);
    } catch (error: any) {
      this._noDevicePermissionToast(error, CallMediaType.VIDEO);
      console.error(`${NAME.PREFIX}openCamera error: ${JSON.stringify(error)}.`);
    }
  }
  @avoidRepeatedCall()
  public async closeCamera() {
    try {
      await this._tuiCallEngine.closeCamera();
      this._setLocalUserInfoAudioVideoAvailable(false, NAME.VIDEO);
    } catch (error: any) {
      console.error(`${NAME.PREFIX}closeCamera error: ${JSON.stringify(error)}.`);
    }
  }
  @avoidRepeatedCall()
  public async openMicrophone() {
    try {
      await this._tuiCallEngine.openMicrophone();
      this._setLocalUserInfoAudioVideoAvailable(true, NAME.AUDIO);
    } catch (error: any) {
      console.error(`${NAME.PREFIX}openMicrophone failed, error: ${JSON.stringify(error)}.`);
    }
  }
  @avoidRepeatedCall()
  public async closeMicrophone() {
    try {
      await this._tuiCallEngine.closeMicrophone();
      this._setLocalUserInfoAudioVideoAvailable(false, NAME.AUDIO);
    } catch (error: any) {
      console.error(`${NAME.PREFIX}closeMicrophone failed, error: ${JSON.stringify(error)}.`);
    }
  }
  @avoidRepeatedCall()
  public switchScreen(userId: string) {
    if(!userId) return;
    TUIStore.update(StoreName.CALL, NAME.BIG_SCREEN_USER_ID, userId);
  }
  // support video to audio; not support audio to video
  @avoidRepeatedCall()
  public async switchCallMediaType() {
    try {
      const callMediaType = TUIStore.getData(StoreName.CALL, NAME.CALL_MEDIA_TYPE);
      if (callMediaType === CallMediaType.AUDIO) {
        console.warn(`${NAME.PREFIX}switchCallMediaType failed, ${callMediaType} not support.`);
        return;
      }
      const response = await this._tuiCallEngine.switchCallMediaType(CallMediaType.AUDIO);
      if (response?.code === 0) {
        this._callTUIService({ message: response?.data?.message });
      }
      TUIStore.update(StoreName.CALL, NAME.CALL_MEDIA_TYPE, CallMediaType.AUDIO);
      const isGroup = TUIStore.getData(StoreName.CALL, NAME.IS_GROUP);
      const oldStatus = isGroup ? StatusChange.CALLING_GROUP_VIDEO : StatusChange.CALLING_C2C_VIDEO;
      const newStatus = generateStatusChangeText(TUIStore);
      this.statusChanged && this.statusChanged({ oldStatus, newStatus });
    } catch (error: any) {
      console.error(`${NAME.PREFIX}switchCallMediaType failed, error: ${JSON.stringify(error)}.`);
    }
  }
  // 切前后置 miniProgram, 切扬声器
  public getTim() {
    if (this._tim) return this._tim;
    if (!this._tuiCallEngine) {
      console.warn(`${NAME.PREFIX}getTim warning: _tuiCallEngine Instance is not available.`);
      return null;
    }
    return this._tuiCallEngine?.tim || this._tuiCallEngine?.getTim(); // mini support getTim interface
  }
  @avoidRepeatedCall()
  public async switchDevice(params) {
    try {
      await this._tuiCallEngine.switchDevice(params);
    } catch (error) {
      console.error(`${NAME.PREFIX}_switchDevice failed, error: ${JSON.stringify(error)}.`);
    }
  }
  // ==========================【TUICallEngine 事件处理】==========================
  private _addListenTuiCallEngineEvent() {
    if (!this._tuiCallEngine) {
      console.warn(`${NAME.PREFIX}add engine event listener failed, engine is empty.`);
      return;
    }
    this._tuiCallEngine.on(TUICallEvent.ERROR, this._handleError, this);
    this._tuiCallEngine.on(TUICallEvent.INVITED, this._handleNewInvitationReceived, this); // 收到邀请事件
    this._tuiCallEngine.on(TUICallEvent.USER_ACCEPT, this._handleUserAccept, this); // 主叫收到被叫接通事件
    this._tuiCallEngine.on(TUICallEvent.USER_ENTER, this._handleUserEnter, this); // 有用户进房事件
    this._tuiCallEngine.on(TUICallEvent.USER_LEAVE, this._handleUserLeave, this); // 有用户离开通话事件
    this._tuiCallEngine.on(TUICallEvent.REJECT, this._handleInviteeReject, this); // 主叫收到被叫的拒绝通话事件
    this._tuiCallEngine.on(TUICallEvent.NO_RESP, this._handleNoResponse, this); // 主叫收到被叫的无应答事件
    this._tuiCallEngine.on(TUICallEvent.LINE_BUSY, this._handleLineBusy, this); // 主叫收到被叫的忙线事件
    this._tuiCallEngine.on(TUICallEvent.CALLING_CANCEL, this._handleCallingCancel, this); // 主被叫在通话未建立时, 收到的取消事件
    this._tuiCallEngine.on(TUICallEvent.SDK_READY, this._handleSDKReady, this); // SDK Ready 回调
    this._tuiCallEngine.on(TUICallEvent.KICKED_OUT, this._handleKickedOut, this); // 未开启多端登录时, 多端登录收到的被踢事件
    this._tuiCallEngine.on(TUICallEvent.MESSAGE_SENT_BY_ME, this._messageSentByMe, this);
    this._tuiCallEngine.on(TUICallEvent.CALLING_END, this._handleCallingEnd, this); // 主被叫在通话结束时, 收到的通话结束事件
    this._tuiCallEngine.on(TUICallEvent.CALL_TYPE_CHANGED, this._handleCallTypeChange, this);
    this._tuiCallEngine.on(TUICallEvent.USER_VIDEO_AVAILABLE, this._handleUserVideoAvailable, this);
    this._tuiCallEngine.on(TUICallEvent.USER_AUDIO_AVAILABLE, this._handleUserAudioAvailable, this);
    this._tuiCallEngine.on(TUICallEvent.USER_VOICE_VOLUME, this._handleUserVoiceVolume, this);
    this._tuiCallEngine.on(TUICallEvent.DEVICED_UPDATED, this._handleDeviceUpdate, this);
  }
  private _removeListenTuiCallEngineEvent() {
    this._tuiCallEngine.off(TUICallEvent.ERROR, this._handleError);
    this._tuiCallEngine.off(TUICallEvent.INVITED, this._handleNewInvitationReceived);
    this._tuiCallEngine.off(TUICallEvent.USER_ACCEPT, this._handleUserAccept);
    this._tuiCallEngine.off(TUICallEvent.USER_ENTER, this._handleUserEnter);
    this._tuiCallEngine.off(TUICallEvent.USER_LEAVE, this._handleUserLeave);
    this._tuiCallEngine.off(TUICallEvent.REJECT, this._handleInviteeReject);
    this._tuiCallEngine.off(TUICallEvent.NO_RESP, this._handleNoResponse);
    this._tuiCallEngine.off(TUICallEvent.LINE_BUSY, this._handleLineBusy);
    this._tuiCallEngine.off(TUICallEvent.CALLING_CANCEL, this._handleCallingCancel);
    this._tuiCallEngine.off(TUICallEvent.SDK_READY, this._handleSDKReady);
    this._tuiCallEngine.off(TUICallEvent.KICKED_OUT, this._handleKickedOut);
    this._tuiCallEngine.off(TUICallEvent.MESSAGE_SENT_BY_ME, this._messageSentByMe);
    this._tuiCallEngine.off(TUICallEvent.CALLING_END, this._handleCallingEnd);
    this._tuiCallEngine.off(TUICallEvent.CALL_TYPE_CHANGED, this._handleCallTypeChange); // TODO: web 是 CALL_TYPE_CHANGED 事件, miniProgram 为 CALL_MODE
    this._tuiCallEngine.off(TUICallEvent.USER_VIDEO_AVAILABLE, this._handleUserVideoAvailable);
    this._tuiCallEngine.off(TUICallEvent.USER_AUDIO_AVAILABLE, this._handleUserAudioAvailable);
    this._tuiCallEngine.off(TUICallEvent.USER_VOICE_VOLUME, this._handleUserVoiceVolume); // web
    this._tuiCallEngine.off(TUICallEvent.DEVICED_UPDATED, this._handleDeviceUpdate);
  }
  private _handleError(event: any): void {
    const { code, message } = event || {};
    const index = Object.values(ErrorCode).indexOf(code);
    let callTips = '';
    if (index !== -1) {
      const key = Object.keys(ErrorCode)[index];
      callTips = t(ErrorMessage[key]);
      callTips && TUIStore.update(StoreName.CALL, NAME.TOAST_INFO, { text: callTips, type: NAME.ERROR });
    }
    this._executeExternalAfterCalling();
    console.error(`${NAME.PREFIX}_handleError, errorCode: ${code}; errorMessage: ${callTips || message}.`);
  }
  private async _handleNewInvitationReceived(event: any) {
    console.log(`${NAME.PREFIX}onCallReceived event data: ${JSON.stringify(event)}.`);
    const { sponsor = '', isFromGroup, callMediaType, inviteData = {}, calleeIdList = [], groupID = '' } = this._analyzeEventData(event);
    const currentUserInfo: IUserInfo = TUIStore.getData(StoreName.CALL, NAME.LOCAL_USER_INFO);
    const remoteUserIdList: string[] = [sponsor, ...calleeIdList.filter((userId: string) => userId !== currentUserInfo.userId)];
    const type = callMediaType || inviteData.callType;
    const callTipsKey = type === CallMediaType.AUDIO ? CallTips.CALLEE_CALLING_AUDIO_MSG : CallTips.CALLEE_CALLING_VIDEO_MSG;
    let updateStoreParams = {
      [NAME.CALL_ROLE]: CallRole.CALLEE,
      [NAME.IS_GROUP]: isFromGroup,
      [NAME.CALL_STATUS]: CallStatus.CALLING,
      [NAME.CALL_MEDIA_TYPE]: type,
      [NAME.CALL_TIPS]: t(callTipsKey),
      [NAME.CALLER_USER_INFO]: { userId: sponsor },
      [NAME.GROUP_ID]: groupID,
    };
    TUIStore.updateStore(updateStoreParams, StoreName.CALL);
    this._executeExternalBeforeCalling();
    this.statusChanged && this.statusChanged({ oldStatus: StatusChange.IDLE, newStatus: StatusChange.BE_INVITED });

    const remoteUserInfoList = await getRemoteUserProfile(remoteUserIdList, this.getTim(), TUIStore);
    const [userInfo] = remoteUserInfoList.filter((userInfo: IUserInfo) => userInfo.userId === sponsor);
    remoteUserInfoList.length > 0 && TUIStore.updateStore({
      [NAME.REMOTE_USER_INFO_LIST]: remoteUserInfoList,
      [NAME.CALLER_USER_INFO]: {
        userId: sponsor,
        nick: userInfo?.nick || '',
        avatar: userInfo?.avatar || '',
      },
    }, StoreName.CALL);
  }
  private _handleUserAccept(event: any): void {
    this._callerChangeToConnected();
    console.log(`${NAME.PREFIX}accept event data: ${JSON.stringify(event)}.`);
  }
  private async _handleUserEnter(event: any): Promise<void> {
    this._callerChangeToConnected();
    const { userID: userId, data } = this._analyzeEventData(event);
    let remoteUserInfoList = TUIStore.getData(StoreName.CALL, NAME.REMOTE_USER_INFO_LIST);
    const isInRemoteUserList = remoteUserInfoList.find(item => item?.userId === userId);
    if (!isInRemoteUserList) {
      remoteUserInfoList.push({ userId });
      remoteUserInfoList.length > 0 && TUIStore.update(StoreName.CALL, NAME.REMOTE_USER_INFO_LIST, remoteUserInfoList);
      const [userInfo] = await getRemoteUserProfile([userId], this.getTim(), TUIStore);
      remoteUserInfoList = TUIStore.getData(StoreName.CALL, NAME.REMOTE_USER_INFO_LIST);
      remoteUserInfoList.forEach((obj) => {
        if (obj?.userId === userId) {
          obj = Object.assign(obj, userInfo);
        }
      });
    }
    remoteUserInfoList = remoteUserInfoList.map((obj: IUserInfo) => {
      if (obj.userId === userId) obj.isEnter = true;
      return obj;
    });
    remoteUserInfoList.length > 0 && TUIStore.update(StoreName.CALL, NAME.REMOTE_USER_INFO_LIST, remoteUserInfoList);
    console.log(`${NAME.PREFIX}userEnter event data: ${JSON.stringify(event)}.`);
  }
  private _callerChangeToConnected() {
    const callRole = TUIStore.getData(StoreName.CALL, NAME.CALL_ROLE);
    const callStatus = TUIStore.getData(StoreName.CALL, NAME.CALL_STATUS);
    if (callStatus === CallStatus.CALLING && callRole === CallRole.CALLER) {
      TUIStore.update(StoreName.CALL, NAME.CALL_STATUS, CallStatus.CONNECTED);
      this._startTimer();
    }
  }
  private _handleUserLeave(event: any): void {
    console.log(`${NAME.PREFIX}userLeave event data: ${JSON.stringify(event)}.`);
    const { data, userID: userId } = this._analyzeEventData(event);
    if (TUIStore.getData(StoreName.CALL, NAME.IS_GROUP)) {
      const text = generateText(TUIStore, CallTips.END_CALL, userId);
      TUIStore.update(StoreName.CALL, NAME.TOAST_INFO, { text });
    }
    userId && this._deleteRemoteUser([userId]);
  }
  private _unNormalEventsManager(event: any, eventName: TUICallEvent): void {
    console.log(`${NAME.PREFIX}${eventName} event data: ${JSON.stringify(event)}.`);
    const isGroup = TUIStore.getData(StoreName.CALL, NAME.IS_GROUP);
    switch (eventName) {
      case TUICallEvent.REJECT:
      case TUICallEvent.LINE_BUSY: {
        const { userID: userId } = this._analyzeEventData(event);
        let callTipsKey = eventName === TUICallEvent.REJECT ? CallTips.OTHER_SIDE_REJECT_CALL : CallTips.OTHER_SIDE_LINE_BUSY;
        let text = generateText(TUIStore, callTipsKey);
        if (isGroup) {
          callTipsKey = eventName === TUICallEvent.REJECT ? CallTips.REJECT_CALL : CallTips.IN_BUSY;
          text = generateText(TUIStore, callTipsKey, userId);
        }
        TUIStore.update(StoreName.CALL, NAME.TOAST_INFO, { text });
        userId && this._deleteRemoteUser([userId]);
        break;
      }
      case TUICallEvent.NO_RESP: {
        const { userIDList = [] } = this._analyzeEventData(event);
        const callTipsKey = isGroup ? CallTips.TIMEOUT : CallTips.CALL_TIMEOUT;
        const text = isGroup ? generateText(TUIStore, callTipsKey, userIDList.join()) : generateText(TUIStore, callTipsKey);
        TUIStore.update(StoreName.CALL, NAME.TOAST_INFO, { text });
        userIDList.length > 0 && this._deleteRemoteUser(userIDList);
        break;
      }
      case TUICallEvent.CALLING_CANCEL: {
        // TUIStore.update(StoreName.CALL, NAME.TOAST_INFO, { text: generateText(TUIStore, CallTips.CANCEL) });
        this._resetCallStore();
        break;
      }
    }
  }
  private _handleInviteeReject(event: any): void {
    this._unNormalEventsManager(event, TUICallEvent.REJECT);
  }
  private _handleNoResponse(event: any): void {
    this._unNormalEventsManager(event, TUICallEvent.NO_RESP);
  }
  private _handleLineBusy(event: any): void {
    this._unNormalEventsManager(event, TUICallEvent.LINE_BUSY);
  }
  private _handleCallingCancel(event: any): void {
    this._executeExternalAfterCalling();
    this._unNormalEventsManager(event, TUICallEvent.CALLING_CANCEL);
  }
  private _handleCallingEnd(event: any): void {
    console.log(`${NAME.PREFIX}callEnd event data: ${JSON.stringify(event)}.`);
    this._executeExternalAfterCalling();
    this._resetCallStore();
  }
  // SDK_READY 后才能调用 tim 接口, 否则登录后立刻获取导致调用接口失败. v2.27.4+、v3 接口 login 后会抛出 SDK_READY
  private async _handleSDKReady(event: any): Promise<void> {
    let localUserInfo: IUserInfo = TUIStore.getData(StoreName.CALL, NAME.LOCAL_USER_INFO);
    localUserInfo = await getMyProfile(localUserInfo.userId, this.getTim(), TUIStore); // 方法里已经 try...catch 了
    TUIStore.update(StoreName.CALL, NAME.LOCAL_USER_INFO, localUserInfo);
  }
  private _handleKickedOut(event: any): void {
    console.log(`${NAME.PREFIX}kickOut event data: ${JSON.stringify(event)}.`);
    this.kickedOut && this.kickedOut(event);
    TUIStore.update(StoreName.CALL, NAME.CALL_TIPS, generateText(TUIStore, CallTips.KICK_OUT));
    this._resetCallStore();
  }
  private _handleCallTypeChange(event: any): void {
    const { newCallType, type } = this._analyzeEventData(event);
    TUIStore.update(StoreName.CALL, NAME.CALL_MEDIA_TYPE, newCallType || type);
  }
  private _messageSentByMe(event: any): void {
    const message = event?.data;
    this.onMessageSentByMe && this.onMessageSentByMe(message);
  }
  // =============================【 WEB 私有事件】==============================
  private async _handleUserVideoAvailable(event: any): Promise<any> {
    const { userID: userId, isVideoAvailable } = this._analyzeEventData(event);
    console.log(`${NAME.PREFIX}_handleUserVideoAvailable event data: ${JSON.stringify(event)}.`);
    isVideoAvailable && await this._startRemoteView(userId);
    this._setRemoteUserInfoAudioVideoAvailable(isVideoAvailable, NAME.VIDEO, userId);
  }
  private _handleUserAudioAvailable(event: any): void  {
    const { userID: userId, isAudioAvailable } = this._analyzeEventData(event);
    console.log(`${NAME.PREFIX}_handleUserAudioAvailable event data: ${JSON.stringify(event)}.`);
    this._setRemoteUserInfoAudioVideoAvailable(isAudioAvailable, NAME.AUDIO, userId);
  }
  private _handleUserVoiceVolume(event: any): void {
    try {
      const { volumeMap: volumeList } = this._analyzeEventData(event);
      if ((volumeList || []).length === 0) return; // 减少不必要的更新
      const localUserInfo: IUserInfo = TUIStore.getData(StoreName.CALL, NAME.LOCAL_USER_INFO);
      let remoteUserInfoList: IUserInfo[] = TUIStore.getData(StoreName.CALL, NAME.REMOTE_USER_INFO_LIST);
      const [localUserVolumeObj] = volumeList.filter((obj: any) => obj.userId === localUserInfo.userId);
      const remoteUserVolumeObj = volumeList.reduce((acc: any, obj: any) => {
        if (obj.userId !== localUserInfo.userId) {
          return { ...acc, [obj.userId]: obj.audioVolume };
        }
        return acc;
      }, {});
      localUserInfo.volume = localUserVolumeObj.audioVolume;
      remoteUserInfoList = remoteUserInfoList.map((obj: any) => ({ ...obj, volume: remoteUserVolumeObj[obj.userId] }));
      const updateStoreParams = {
        [NAME.LOCAL_USER_INFO]: localUserInfo,
        [NAME.REMOTE_USER_INFO_LIST]: remoteUserInfoList,
      };
      TUIStore.updateStore(updateStoreParams, StoreName.CALL);
    } catch (error) {
      console.debug(error);
    }
  }
  private _handleDeviceUpdate(event: any): void {
    const { cameraList, microphoneList, currentCamera, currentMicrophone } = event;
    TUIStore.update(StoreName.CALL, NAME.DEVICE_LIST, { cameraList, microphoneList, currentCamera, currentMicrophone });
  }
  private _updateDeviceList() {
    this._tuiCallEngine.getDeviceList('camera').then((result) => {
      const deviceList = TUIStore.getData(StoreName.CALL, NAME.DEVICE_LIST);
      const currentCamera = result?.[0] || {};
      TUIStore.update(
        StoreName.CALL,
        NAME.DEVICE_LIST,
        { ...deviceList, cameraList: result, currentCamera },
      );
    }).catch(error => {
      console.error(`${NAME.PREFIX}updateCameraList failed, error: ${JSON.stringify(error)}.`);
    });
    this._tuiCallEngine.getDeviceList('microphones').then((result) => {
      const deviceList = TUIStore.getData(StoreName.CALL, NAME.DEVICE_LIST);
      const currentMicrophone = result?.[0] || {};
      TUIStore.update(
        StoreName.CALL,
        NAME.DEVICE_LIST,
        { ...deviceList, microphoneList: result, currentMicrophone },
      );
    }).catch(error => {
      console.error(`${NAME.PREFIX}updateMicrophoneList failed, error: ${JSON.stringify(error)}.`);
    });
  }
  // ==========================【 miniProgram 私有事件】==========================
  // 处理 “呼叫” 抛出的异常
  private _handleCallError(error: any, methodName?: string) {
    if (handleRepeatedCallError(error)) return;
    this._noDevicePermissionToast(error, CallMediaType.AUDIO);
    console.error(`${NAME.PREFIX}${methodName} failed, error: ${JSON.stringify(error)}.`);
    this._resetCallStore();
    throw error;
  }
  // ========================【原 Web CallKit 提供的方法】========================
  public beforeCalling: ((...args: any[]) => void) | undefined; // 原来
  public afterCalling: ((...args: any[]) => void) | undefined;
  public onMinimized: ((...args: any[]) => void) | undefined;
  public onMessageSentByMe: ((...args: any[]) => void) | undefined;
  public kickedOut: ((...args: any[]) => void) | undefined;
  public statusChanged: ((...args: any[]) => void) | undefined;
  public setCallback(params: ICallbackParam) {
    const { beforeCalling, afterCalling, onMinimized, onMessageSentByMe, kickedOut, statusChanged } = params;
    beforeCalling && (this.beforeCalling = beforeCalling);
    afterCalling && (this.afterCalling = afterCalling);
    onMinimized && (this.onMinimized = onMinimized);
    onMessageSentByMe && (this.onMessageSentByMe = onMessageSentByMe);
    kickedOut && (this.kickedOut = kickedOut);
    statusChanged && (this.statusChanged = statusChanged);
  }

  public async getDeviceList(deviceType: string) {
    try {
      const response = await this._tuiCallEngine.getDeviceList(deviceType);
      return response;
    } catch (error: any) {
      this._handleCallError(error, 'call');
    }
  };
  public toggleMinimize() {
    const isMinimized = TUIStore.getData(StoreName.CALL, NAME.IS_MINIMIZED);
    TUIStore.update(StoreName.CALL, NAME.IS_MINIMIZED, !isMinimized);
    console.log(`${NAME.PREFIX}toggleMinimize: ${isMinimized} -> ${!isMinimized}.`);
    this.onMinimized && this.onMinimized(isMinimized, !isMinimized);
  }
  private _executeExternalBeforeCalling(): void {
    this.beforeCalling && this.beforeCalling();
  }
  private _executeExternalAfterCalling(): void {
    this.afterCalling && this.afterCalling();
  }
  // ========================【TUICallKit 组件属性设置方法】========================
  @paramValidate(VALIDATE_PARAMS.setVideoDisplayMode)
  public setVideoDisplayMode(displayMode: VideoDisplayMode) {
    TUIStore.update(StoreName.CALL, NAME.DISPLAY_MODE, displayMode);
  }
  @paramValidate(VALIDATE_PARAMS.setVideoResolution)
  public async setVideoResolution(resolution: VideoResolution) {
    try {
      if (!resolution) return;
      TUIStore.update(StoreName.CALL, NAME.VIDEO_RESOLUTION, resolution);
      await this._tuiCallEngine.setVideoQuality(resolution);
    } catch (error) {
      console.warn(`${NAME.PREFIX}setVideoResolution failed, error: ${JSON.stringify(error)}.`);
    }
  }
  // =============================【 WEB 私有公共方法】=============================
  private async _startRemoteView(userId: string) {
    if (!userId) {
      console.log(`${NAME.PREFIX}_startRemoteView userID is empty`);
      return;
    }
    if (!document.getElementById(userId)) {
      console.warn(`${NAME.PREFIX}_startRemoteView can't find HTMLElement id: ${userId}`);
      return;
    }
    try {
      const displayMode = TUIStore.getData(StoreName.CALL, NAME.DISPLAY_MODE);
      await this._tuiCallEngine.startRemoteView({ userID: userId, videoViewDomID: userId, options: { objectFit: displayMode } });
    } catch (error: any) {
      console.error(`${NAME.PREFIX}_startRemoteView error: ${JSON.stringify(error)}.`);
    }
  }
  private _setRemoteUserInfoAudioVideoAvailable(isAvailable: boolean, type: string, userId: string) {
    let remoteUserInfoList = TUIStore.getData(StoreName.CALL, NAME.REMOTE_USER_INFO_LIST);
    remoteUserInfoList = remoteUserInfoList.map((obj: IUserInfo) => {
      if (obj.userId === userId) {
        if (type === NAME.AUDIO) {
          return { ...obj, isAudioAvailable: isAvailable };
        }
        if (type === NAME.VIDEO) {
          return { ...obj, isVideoAvailable: isAvailable };
        }
      }
      return obj;
    });
    remoteUserInfoList.length > 0 && TUIStore.update(StoreName.CALL, NAME.REMOTE_USER_INFO_LIST, remoteUserInfoList);
  }
  private _setLocalUserInfoAudioVideoAvailable(isAvailable: boolean, type: string) {
    let localUserInfo = TUIStore.getData(StoreName.CALL, NAME.LOCAL_USER_INFO);
    if (type === NAME.AUDIO) {
      localUserInfo = { ...localUserInfo, isAudioAvailable: isAvailable };
    }
    if (type === NAME.VIDEO) {
      localUserInfo = { ...localUserInfo, isVideoAvailable: isAvailable };
    }
    TUIStore.update(StoreName.CALL, NAME.LOCAL_USER_INFO, localUserInfo);
  }
  private async _updateCallStoreBeforeCall(type: number, remoteUserInfoList: IUserInfo[], groupID?: string): Promise<void> {
    let updateStoreParams: any = {
      [NAME.CALL_MEDIA_TYPE]: type,
      [NAME.CALL_ROLE]: CallRole.CALLER,
      [NAME.REMOTE_USER_INFO_LIST]: remoteUserInfoList,
      [NAME.IS_GROUP]: !!groupID,
      [NAME.CALL_TIPS]: t(CallTips.CALLER_CALLING_MSG),
      [NAME.GROUP_ID]: groupID
    };
    TUIStore.updateStore({ ...updateStoreParams, [NAME.CALL_STATUS]: CallStatus.CALLING }, StoreName.CALL);
    this.statusChanged && this.statusChanged({
      oldStatus: StatusChange.IDLE,
      newStatus: groupID ? StatusChange.DIALING_GROUP : StatusChange.DIALING_C2C,
    });
    this._updateDeviceList();
    const remoteUserInfoLists = await getRemoteUserProfile(remoteUserInfoList.map(obj => obj.userId), this.getTim(), TUIStore);
    remoteUserInfoLists.length > 0 && TUIStore.update(StoreName.CALL, NAME.REMOTE_USER_INFO_LIST, remoteUserInfoLists);
  }
  private async _updateCallStoreAfterCall(userIdList: string[], response: any) {
    if (response) {
      TUIStore.update(StoreName.CALL, NAME.IS_CLICKABLE, true);
      TUIStore.update(StoreName.CALL, NAME.ROOM_ID, response.roomID);
      if (response.code === 0) {
        this._callTUIService({ message: response?.data?.message });
        const callMediaType = TUIStore.getData(StoreName.CALL, NAME.CALL_MEDIA_TYPE);
        (callMediaType === CallMediaType.VIDEO) && await this.openCamera(NAME.LOCAL_VIDEO);
        try {
          await this._tuiCallEngine.setVideoQuality(TUIStore.getData(StoreName.CALL, NAME.VIDEO_RESOLUTION));
        } catch (error) {
          console.warn(`${NAME.PREFIX}setVideoQuality failed, error: ${JSON.stringify(error)}.`);
        }
      } else {
        this._resetCallStore();
        return;
      }
      const localUserInfo = TUIStore.getData(StoreName.CALL, NAME.LOCAL_USER_INFO);
      TUIStore.update(StoreName.CALL, NAME.LOCAL_USER_INFO, { ...localUserInfo, isEnter: true });
      this._setLocalUserInfoAudioVideoAvailable(true, NAME.AUDIO); // web && mini, default open audio
    } else {
      this._resetCallStore();
    }
  }
  private _resetCurrentDevice() {
    // 挂断后，重置当前摄像头和麦克风为默认设备
    const { cameraList, microphoneList } = TUIStore.getData(StoreName.CALL, NAME.DEVICE_LIST);
    TUIStore.update(
      StoreName.CALL,
      NAME.DEVICE_LIST,
      { microphoneList, cameraList, currentCamera: cameraList?.[0] || {}, currentMicrophone: microphoneList?.[0] || {} },
    );
  }
  private _resetCallStore() {
    const oldStatusStr = generateStatusChangeText(TUIStore);
    this._stopTimer();
    // localUserInfo, language 在通话结束后不需要清除
    // callStatus 清除需要通知; isMinimized 也需要通知（basic-vue3 中切小窗关闭后, 再呼叫还是小窗, 因此需要通知到组件侧）
    // isGroup 也不清除(engine 先抛 cancel 事件, 再抛 reject 事件)
    // displayMode、videoResolution 也不能清除, 组件不卸载, 这些属性也需保留, 否则采用默认值.
    // enableFloatWindow 不清除：开启/关闭悬浮窗功能。
    let notResetOrNotifyKeys = Object.keys(CALL_DATA_KEY).filter((key) => {
      switch (CALL_DATA_KEY[key]) {
        case NAME.CALL_STATUS:
        case NAME.LANGUAGE:
        case NAME.IS_GROUP:
        case NAME.DISPLAY_MODE:
        case NAME.VIDEO_RESOLUTION:
        case NAME.ENABLE_FLOAT_WINDOW:
        case NAME.LOCAL_USER_INFO: {
          return false;
        }
        default: {
          return true;
        }
      }
    });
    notResetOrNotifyKeys = notResetOrNotifyKeys.map(key => CALL_DATA_KEY[key]);
    TUIStore.reset(StoreName.CALL, notResetOrNotifyKeys);
    const callStatus = TUIStore.getData(StoreName.CALL, NAME.CALL_STATUS);
    callStatus !== CallStatus.IDLE && TUIStore.reset(StoreName.CALL, [NAME.CALL_STATUS], true); // callStatus reset need notify
    TUIStore.reset(StoreName.CALL, [NAME.IS_MINIMIZED], true); // isMinimized reset need notify
    TUIStore.reset(StoreName.CALL, [NAME.IS_EAR_PHONE], true); // isEarPhone reset need notify
    TUIStore.update(StoreName.CALL, NAME.LOCAL_USER_INFO, {
      ...TUIStore.getData(StoreName.CALL, NAME.LOCAL_USER_INFO),
      isVideoAvailable: false,
      isAudioAvailable: false,
    });
    this._resetCurrentDevice();
    const newStatusStr = generateStatusChangeText(TUIStore);
    if (oldStatusStr !== newStatusStr) {
      this.statusChanged && this.statusChanged({ oldStatus: oldStatusStr, newStatus: newStatusStr });
    }
  }
  private _noDevicePermissionToast(error: any, type: CallMediaType): void {
    if (handleNoDevicePermissionError(error)) {
      let text = '';
      if (type === CallMediaType.AUDIO) {
        text = generateText(TUIStore, CallTips.NO_MICROPHONE_DEVICE_PERMISSION);
      }
      if (type === CallMediaType.VIDEO) {
        text = generateText(TUIStore, CallTips.NO_CAMERA_DEVICE_PERMISSION);
      }

      const permission = this._tuiCallEngine?.getDevicePermission();
      if (!permission?.audio) {
        TUIStore.update(StoreName.CALL, NAME.SHOW_PERMISSION_TIP, true);
      }

      text && TUIStore.update(StoreName.CALL, NAME.TOAST_INFO, { text, type: NAME.ERROR });
      console.error(`${NAME.PREFIX}call failed, error: ${error.message}.`);
    }
  }
  // 通话时长更新
  private _startTimer(): void {
    if (this._timerId === -1) {
      this._timerId = timer.run(NAME.TIMEOUT, this._updateCallDuration.bind(this), { delay: 1000 });
    }
  }
  private _updateCallDuration(): void {
    let callDurationStr = TUIStore.getData(StoreName.CALL, NAME.CALL_DURATION);
    const callDurationNum = formatTimeInverse(callDurationStr);
    callDurationStr = formatTime(callDurationNum + 1);
    TUIStore.update(StoreName.CALL, NAME.CALL_DURATION, callDurationStr);
  }
  private _stopTimer(): void {
    if (this._timerId !== -1) {
      timer.clearTask(this._timerId);
      this._timerId = -1;
    }
  }
  private _deleteRemoteUser(userIdList: string[]): void {
    if (userIdList.length === 0) return;
    let remoteUserInfoList = TUIStore.getData(StoreName.CALL, NAME.REMOTE_USER_INFO_LIST);
    userIdList.forEach((userId) => {
      remoteUserInfoList = remoteUserInfoList.filter((obj: IUserInfo) => obj.userId !== userId);
    });
    TUIStore.update(StoreName.CALL, NAME.REMOTE_USER_INFO_LIST, remoteUserInfoList);
  }
  private _analyzeEventData(event: any): any {
    return event || {}; // web INVITED
  }
  // =========================【调用 chat api】=========================
  // 获取群成员
  public async getGroupMemberList(count: number, offset: number) {
    const groupID = TUIStore.getData(StoreName.CALL, NAME.GROUP_ID);
    let groupMemberList = await getGroupMemberList(groupID, this.getTim(), count, offset);
    return groupMemberList;
  }
  // 获取群信息
  public async getGroupProfile() {
    const groupID: string = TUIStore.getData(StoreName.CALL, NAME.GROUP_ID);
    return await getGroupProfile(groupID, this.getTim());
  }
  // =========================【监听 TUIStore 中的状态】=========================
  private _handleCallStatusChange = async (value: CallStatus) => {
    try {
      const bellParams: IBellParams = {
        callRole: TUIStore.getData(StoreName.CALL, NAME.CALL_ROLE),
        callStatus: TUIStore.getData(StoreName.CALL, NAME.CALL_STATUS),
      };
      this._bellContext.setBellProperties(bellParams);
      if (value === CallStatus.CALLING) {
        await this?._bellContext?.play();
      } else {
        // 状态变更通知
        if (value === CallStatus.CONNECTED) {
          const isGroup = TUIStore.getData(StoreName.CALL, NAME.IS_GROUP);
          const callMediaType = TUIStore.getData(StoreName.CALL, NAME.CALL_MEDIA_TYPE);
          const remoteUserInfoList = TUIStore.getData(StoreName.CALL, NAME.REMOTE_USER_INFO_LIST);
          const oldStatus = isGroup ? StatusChange.DIALING_GROUP : StatusChange.DIALING_C2C;
          this.statusChanged && this.statusChanged({ oldStatus, newStatus: generateStatusChangeText(TUIStore) });
          if (!isGroup && callMediaType === CallMediaType.VIDEO) {
            this.switchScreen(remoteUserInfoList[0].domId);
          }
        }
        await this?._bellContext?.stop();
      }
    } catch (error) {
      console.warn(`${NAME.PREFIX}handleCallStatusChange, ${error}.`);
    }
  };
  private _watchTUIStore() {
    TUIStore?.watch(StoreName.CALL, {
      [NAME.CALL_STATUS]: this._handleCallStatusChange,
    });
  }
  private _unwatchTUIStore() {
    TUIStore?.unwatch(StoreName.CALL, {
      [NAME.CALL_STATUS]: this._handleCallStatusChange,
    });
  }
  // =========================【web 融合 chat 提供的方法】=========================
  public bindTUICore(TUICore: any) {
    this._TUICore = TUICore;
  }
  // 下面方法用于接入 TUICore
  private _callTUIService(params) {
    const { message } = params || {};
    TUICore.callService({
      serviceName: TUIConstants.TUIChat.SERVICE.NAME,
      method: TUIConstants.TUIChat.SERVICE.METHOD.UPDATE_MESSAGE_LIST,
      params: { message },
    });
  }
  public async onNotifyEvent(eventName: string, subKey: string) {
    try {
      if (eventName === TUIConstants.TUILogin.EVENT.LOGIN_STATE_CHANGED) {
        if (subKey === TUIConstants.TUILogin.EVENT_SUB_KEY.USER_LOGIN_SUCCESS) {
          // TUICallkit 收到登录成功时执行自己的业务逻辑处理
          // @ts-ignore
          const { chat, userID, userSig, SDKAppID } = TUILogin.getContext();
          await this.init({ tim: chat, userID, userSig, sdkAppID: SDKAppID, isFromChat: true });
        } else if (subKey === TUIConstants.TUILogin.EVENT_SUB_KEY.USER_LOGOUT_SUCCESS) {
          await this.destroyed();
        }
      }
    } catch (error) {
      console.error(`${NAME.PREFIX}TUICore onNotifyEvent failed, error: ${JSON.stringify(error)}.`);
    }
  }
  public async onCall(method: String, params: any) {
    if (method === TUIConstants.TUICalling.SERVICE.METHOD.START_CALL) {
      await this._handleTUICoreOnClick(params, params.type);
    }
  }
  private async _handleTUICoreOnClick(options, type: CallMediaType) {
    try {
      const { groupID, userIDList = [], ...rest } = options;
      if (groupID) {
        await this.groupCall({ groupID, userIDList, type, ...rest });
      } else if (userIDList.length === 1) {
        await this.call({ userID: userIDList[0], type, ...rest });
      }
    } catch (error: any) {
      console.debug(error);
    }
  }
  public onGetExtension(extensionID: string, params: any) {
    if (extensionID === TUIConstants.TUIChat.EXTENSION.INPUT_MORE.EXT_ID) {
      const list = [];
      const audioCallExtension: ExtensionInfo = {
        weight: 1000,
        text: '语音通话',
        icon: AudioCallIcon,
        data: {
          name: 'voiceCall',
        },
        listener: {
          onClicked: async options => await this._handleTUICoreOnClick(options, options.type || CallMediaType.AUDIO), // 点击时发起通话
        },
      };
      const videoCallExtension: ExtensionInfo = {
        weight: 900,
        text: '视频通话',
        icon: VideoCallIcon,
        data: {
          name: 'videoCall',
        },
        listener: {
          onClicked: async options => await this._handleTUICoreOnClick(options, options.type || CallMediaType.VIDEO), // 点击时发起通话
        },
      };
      if (!params?.filterVoice) {
        list.push(audioCallExtension);
      }
      if (!params?.filterVideo) {
        list.push(videoCallExtension);
      }
      return list;
    }
  }
}