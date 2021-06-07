import {HTTPClient} from "./request.service";

class MainPageService {
  mainPageTabItem = ['精选'/*, '排行榜', '歌单', '歌手', '新碟上新'*/];
  getHomeMainPagePic(type = 0) {
    return HTTPClient.get(`/banner?type=${type}`, {withTimeStamp: true});
  }

  getNewAlbum() {
    return HTTPClient.get(`/album/newest`, {withTimeStamp: true});
  }

  getAllRankList() {
    return HTTPClient.get(`/toplist`, {withTimeStamp: true});
  }
  getPersonalization(offset = 6) {
    return HTTPClient.get(`/personalized?limit=${offset}`, {withTimeStamp: true});
  }
}
export const mainPageService = new MainPageService();
