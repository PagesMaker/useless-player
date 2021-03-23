import {Subject} from "rxjs";
import axios from 'axios';
import {UserInfos} from "./user-info.service";
import {SERVER} from "./app.service";

class HttpClientService {
  defaultConfig = {
    responseType: "json",
    timeout: 5000,
    headers: {"X-Requested-With": "XMLHttpRequest"},
    withCredentials: true,
    observerBody: true,
    baseURL: SERVER
  };
  getCookie(url, withCredentials) {
    const symbol = url.includes('?') ? '&' : '?';
    return UserInfos.cookie === '' || !withCredentials ? '' : `${symbol}cookie=${UserInfos.cookie}`;
  }
  get(url, config) {
    const subject = new Subject();
    config = {
      ...this.defaultConfig,
      ...config
    };
    axios.get(`${url}${this.getCookie(url, config.withCredentials)}`, config).then(res => {
      subject.next(config.observerBody ? res.data : res);
    }).catch(err => {
      subject.error(err);
    })
    return subject.asObservable();
  }
  post(url, body, config = this.defaultConfig) {
    const subject = new Subject();
    config = {
      ...this.defaultConfig,
      ...config
    };
    axios.post(`${url}${this.getCookie(url, config.withCredentials)}`, body, config).then(res => {
      subject.next(config.observerBody ? res.data : res);
    }).catch(err => {
      subject.error(err);
    })
    return subject.asObservable();
  }
}
export const HTTPClient = new HttpClientService();
