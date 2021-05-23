import {HTTPClient} from "./request.service";

class MainPageService {
  mainPageTabItem = ['精选', '排行榜', '歌单', '歌手', '新碟上新'];
  getDiscover() {
    return HTTPClient.get(`/homepage/block/page`, {withTimeStamp: true});
  }
}
export const mainPageService = new MainPageService();
