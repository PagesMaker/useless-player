class UserInfoService{
  userInfo = {userName : '111'};
  isLogin = false;
  get getLoginStatus() {
    return this.isLogin
  }
  set setLoginStatus(v) {
    this.isLogin = v;
  }
  get getUserInfo() {
    return this.userInfo
  }
  set setUserInfo(v) {
    this.userInfo = v;
  }
}
export const UserInfos = new UserInfoService();
