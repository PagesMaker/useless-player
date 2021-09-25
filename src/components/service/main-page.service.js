import {HTTPClient} from "./request.service";

class MainPageService {
  mainPageTabItem = ['精选', '排行榜', '歌单', '歌手'/*, '新碟上新'*/];
  areaEnum = [
    {
      type: '全部',
      data: '-1'
    },
    {
      type: '内地',
      data: '7'
    },
    {
      type: '欧美',
      data: '96'
    },
    {
      type: '日本',
      data: '8'
    },
    {
      type: '韩国',
      data: '16'
    },
    {
      type: '其他',
      data: '0'
    }
  ];
  singerTypeEnum = [
    {
      type: '全部',
      data: '-1'
    },
    {
      type: '男歌手',
      data: '1'
    },
    {
      type: '女歌手',
      data: '2'
    },
    {
      type: '组合',
      data: '3'
    }
  ];
  initialsList = [
    {
      type: '热门',
      data: '-1'
    }
  ];
  constructor() {
    this.initialsList = [{
      type: '热门',
      data: '-1'
    }];
    for (let i = 0; i < 26; i++) {
      this.initialsList.push({
        type: String.fromCharCode(65 + i),
        data: String.fromCharCode(65 + i)
      });
    }
    this.initialsList.push({
      type: '#',
      data: '0'
    });
  }
  getHomeMainPagePic(type = 0) {
    return HTTPClient.get(`/banner?type=${type}`, {withTimeStamp: true});
  }

  getNewAlbum() {
    return HTTPClient.get(`/album/newest`, {withTimeStamp: true});
  }
  getSingers(param = {}) {
    return HTTPClient.get(`/artist/list?type=${param.type || '-1'}&area=${param.area || '-1'}&initial=${param.initial || '-1'}&limit=${param.limit.toString() || '30'}&offset=${param.offset.toString() || '0'}`, {withTimeStamp: true});
  }
  getAllRankList() {
    return HTTPClient.get(`/toplist`, {withTimeStamp: true});
  }
  getPersonalization(offset = 6) {
    return HTTPClient.get(`/personalized?limit=${offset}`, {withTimeStamp: true});
  }
  getTagList() {
    return HTTPClient.get('/playlist/highquality/tags', {withTimeStamp: true});
  }
  getSingerDetail(id) {
    return HTTPClient.get('/artist/detail?id=' + id, {withTimeStamp: true});
  }
  getAllSongCollections(param) {
    if (!param) {
      param = {};
    }
    let query = '';
    if (Object.keys(param).length) {
      query += '?';
      Object.keys(param).forEach((item, index) => {
        if (param[item] !== undefined) {
          query += `${item}=${param[item]}&`;
        }
      });
      query = query.substr(0,query.length - 1);
    }
    return HTTPClient.get('/top/playlist/highquality' + query, {withTimeStamp: true});
  }
}
export const mainPageService = new MainPageService();
