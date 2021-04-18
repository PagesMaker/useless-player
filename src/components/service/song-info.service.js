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
    return HTTPClient.get(`/playlist/tracks?op=${param.op}&tracks=${param.pid}&pid=${param.tracks}`);
  }

  getAlbum(id) {
    return HTTPClient.get(`/album?id=${id}`);
  }
}
export const songInfoService = new SongInfoService();
