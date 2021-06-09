import {Subject} from "rxjs";
import axios from 'axios';
import {UserInfos} from "./user-info.service";
import {SERVER} from "./app.service";

class HttpClientService {
  defaultConfig = {
    responseType: "json",
    timeout: 5000,
    headers: {
      "X-Requested-With": "XMLHttpRequest"
    },
    withCredentials: true,
    observerBody: true,
    baseURL: SERVER
  };
  getCookie(url, config) {
    let timeStamp;
    if (config.withTimeStamp) {
      timeStamp = `${new Date().getTime()}`;
      delete config.withTimeStamp;
    }
    const symbol = url.includes('?') ? '&' : '?';
    let urlStr = UserInfos.cookie === '' || !config.withCredentials ? '' : `${symbol}cookie=${UserInfos.cookie}`;
    if (timeStamp) {
      urlStr += (url + urlStr).includes('?') ? '&timeStamp=' + timeStamp : '?timeStamp=' + timeStamp
    }
    return urlStr;
  }
  get(url, config = {}) {
    const subject = new Subject();
    config = {
      ...this.defaultConfig,
      ...config
    };
    axios.get(`${url}${this.getCookie(url, config)}`, config).then(res => {
      subject.next(config.observerBody ? res.data : res);
    }).catch(err => {
      subject.error(err);
    }).finally(() => {
      subject.complete();
    });
    return subject.asObservable();
  }
  post(url, body, config = {}) {
    const subject = new Subject();
    config = {
      ...this.defaultConfig,
      ...config
    };
    axios.post(`${url}${this.getCookie(url, config)}`, body, config).then(res => {
      subject.next(config.observerBody ? res.data : res);
    }).catch(err => {
      subject.error(err);
    }).finally(() => {
      subject.complete();
    });
    return subject.asObservable();
  }
}
export const HTTPClient = new HttpClientService();
