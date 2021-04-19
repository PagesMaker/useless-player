import {HTTPClient} from "./request.service";

class SongInfoService {
  getLyricsById(id) {
    return HTTPClient.get(`/lyric?id=${id}`, {withTimeStamp: true});
  }
  getUserPlaylist(uid) {
    return HTTPClient.post(`/user/playlist`, {uid}, {withTimeStamp: true});
  }
  getSongDetail(id) {
    return HTTPClient.get(`/song/url?id=${id}`, {withTimeStamp: true});
  }
  getUserPlaylistDetail(id) {
    return HTTPClient.get(`/playlist/detail?id=${id}`, {withTimeStamp: true});
  }

  songListEdit(param) {
    return HTTPClient.get(`/playlist/tracks?op=${param.op}&pid=${param.pid}&tracks=${param.tracks}`, {withTimeStamp: true});
  }

  getAlbum(id) {
    return HTTPClient.get(`/album?id=${id}`);
  }
}
export const songInfoService = new SongInfoService();
