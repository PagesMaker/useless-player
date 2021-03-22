import {Subject} from "rxjs";
import axios from 'axios';
import {UserInfos} from "./user-info.service";
import {SERVER} from "../../main";
const defaultConfig = {
  responseType: "json",
  timeout: 5000,
  headers: {"X-Requested-With": "XMLHttpRequest"},
  withCredentials: true,
  observerBody: true,
  baseURL: SERVER
};
class HttpClientService {
  subscriptions = [];
  get(url, config) {
    const subject = new Subject();
    const len = this.subscriptions.length;
    this.subscriptions[len] = subject;
    config = {
      ...defaultConfig,
      ...config
    };
    url = url.includes('?') ? url + '&' : url + '?';
    axios.get(`${url}cookie=${UserInfos.cookie}`, config).then(res => {
      subject.next(config.observerBody ? res.data : res);
    }).catch(err => {
      subject.error(err);
    }).finally(() => {
      this.subscriptions.splice(len, 1);
      console.log(this.subscriptions);
    });
    return subject.asObservable();
  }
  post(url, body, config = defaultConfig) {
    const subject = new Subject();
    const len = this.subscriptions.length;
    this.subscriptions[len] = subject;
    config = {
      ...defaultConfig,
      ...config
    };
    url = url.includes('?') ? url + '&' : url + '?';
    axios.post(`${url}cookie=${UserInfos.cookie}`, body, config).then(res => {
      subject.next(config.observerBody ? res.data : res);
    }).catch(err => {
      subject.error(err);
    }).finally(() => {
      this.subscriptions.splice(len, 1);
      console.log(this.subscriptions);
    });
    return subject.asObservable();
  }
}
export const HTTPClient = new HttpClientService();
