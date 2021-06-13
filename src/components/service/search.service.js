import {HTTPClient} from "./request.service";

class SearchService {
  searchEnum = {
    songs: 1,
    artists: 100,
    playlists: 1000,
    albums: 10,
    user: 1002,
    mv: 1004,
    lyrics: 1006,
    radio: 1009,
    video: 1014,
    comprehensive: 1018,
    digital: 3000
    // todo 其他类型的搜索没做，也许以后会补上
    // 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频, 1018:综合
  }
  getSearchByKeywords(data) {
    return HTTPClient.post(`/search`, data, {withTimeStamp: true});
  }
  getHotSearchList(searchBy) {
    return HTTPClient.get(`/search/hot${searchBy}`);
  }
  getSearchAdvice(value) {
    return HTTPClient.get(`/search/suggest?keywords=${value}`);
  }
}
export const searchService = new SearchService();
