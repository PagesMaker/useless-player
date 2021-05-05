import {HTTPClient} from "./request.service";


class UserInfoService{
  userInfo = {nickName : ''};
  isLogin = false;
  cookie = '';
  localData = {
    searchHistory: []
  };
  setLocalData() {
    if (!this.userInfo.userId) {
     return;
    }
    localStorage.setItem(this.userInfo.userId,  JSON.stringify(this.localData || {
      searchHistory: []
    }
    ));
  }
  getLocalData() {
    if (!this.userInfo.userId) {
      return;
    }
    this.localData = JSON.parse(localStorage.getItem(this.userInfo.userId)) || {
      searchHistory: []
    };
  }
  logout() {
    return HTTPClient.get(`/logout`);
  }
  loginByQr(time) {
    return HTTPClient.get(`/login/qr/key?timerstamp=${time}`, {withCredentials: false, withTimeStamp: true});
  }
  createQr(key, time) {
    return HTTPClient.get(`/login/qr/create?key=${key}&qrimg=true&timerstamp=${time}`, {withCredentials: false, withTimeStamp: true});
  }
  setQrInterval(key, time) {
    return HTTPClient.get(`/login/qr/check?key=${key}&timerstamp=${time}`, {withCredentials: false, withTimeStamp: true});
  }
  getUserAccount() {
    return HTTPClient.post(`/user/account`, {cookie: UserInfos.cookie}, { withTimeStamp: true});
  }
  getUserDetail(id) {
    return HTTPClient.post(`/user/detail?uid=${id}`,{cookie: UserInfos.cookie}, { withTimeStamp: true});
  }
  getUserSubcount() {
    return HTTPClient.post(`/user/subcount`, {cookie: UserInfos.cookie}, { withTimeStamp: true});
  }

  getCountriesCodeList() {
    return HTTPClient.get(`/countries/code/list`, {withCredentials: false, withTimeStamp: true});
  }
  loginByPassword(param) {
    return HTTPClient.post(`/login/cellphone`, param , {withCredentials: false, withTimeStamp: true});
  }
}
class SettingService{
  lyricsTimeAdjust = 0.3
}
export const UserInfos = new UserInfoService();
export const Settings = new SettingService();
