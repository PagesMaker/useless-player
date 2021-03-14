class UserInfoService{
  userInfo = {userName : ''};
  isLogin = false;
  cookie = '';
}
class SettingService{
  lyricsTimeAdjust = 0.3
}
export const UserInfos = new UserInfoService();
export const Settings = new SettingService();
