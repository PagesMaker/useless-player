import {HTTPClient} from "./request.service";

class SongInfoService {
  getLyricsById(id) {
    return HTTPClient.get(`/lyric?id=${id}`);
  }
  getUserPlaylist(uid) {
    return HTTPClient.post(`/user/playlist`, {uid});
  }
  getSongDetail(id) {
    return HTTPClient.get(`/song/url?id=${id}`);
  }
  getUserPlaylistDetail(id) {
    return HTTPClient.get(`/playlist/detail?id=${id}`);
  }

  songListEdit(param) {
    return HTTPClient.post(`/playlist/tracks`, param);
  }

  getAlbum(id) {
    return HTTPClient.get(`/album?id=${id}`);
  }
}
export const songInfoService = new SongInfoService();
