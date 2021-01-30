import {Subject} from "rxjs";

class BullyService {
  bully = new Subject();
  getMessage() {
    return this.bully.asObservable();
  }
  setMessage(message) {
    this.bully.next(message);
  }
}
export const bully =  new BullyService();
