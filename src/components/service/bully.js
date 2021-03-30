import {AsyncSubject, BehaviorSubject, ReplaySubject, Subject} from "rxjs";

class BullyService {
  subject = new Subject();
  bSubject = new BehaviorSubject();
  rSubject = new ReplaySubject();
  aSubject = new AsyncSubject();
  getMessage() {
    return this.subject.asObservable();
  }
  setMessage(message) {
    this.subject.next(message);
  }
  getBMessage() {
    return this.bSubject.asObservable();
  }
  setBMessage(message) {
    this.bSubject.next(message);
  }
  getAMessage() {
    return this.aSubject.asObservable();
  }
  setAMessage(message) {
    this.aSubject.next(message);
  }
  getRMessage() {
    return this.rSubject.asObservable();
  }
  setRMessage(message) {
    this.rSubject.next(message);
  }
}
export const bully =  new BullyService();
