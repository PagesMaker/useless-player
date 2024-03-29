import {HTTPClient} from "./request.service";

class SongInfoService {
  getLyricsById(id) {
    return HTTPClient.get(`/lyric?id=${id}`, {withTimeStamp: true});
  }
  getUserPlaylist(uid) {
    return HTTPClient.post(`/user/playlist`, {uid}, {withTimeStamp: true});
  }
  getSongUrl(id) {
    return HTTPClient.get(`/song/url?id=${id}`, {withTimeStamp: true});
  }
  getSongDetail(ids) {
    // ids 可以是歌曲id组成的数组，也可以是单个id
    return HTTPClient.get(`/song/detail?ids=${ids}`, {withTimeStamp: true});
  }
  getPlaylistDetail(id) {
    return HTTPClient.get(`/playlist/detail?id=${id}`, {withTimeStamp: true});
  }

  songListEdit(param) {
    return HTTPClient.get(`/playlist/tracks?op=${param.op}&pid=${param.pid}${param.tracks ? `&tracks=${param.tracks}` : ''}`, {withTimeStamp: true});
  }

  getAlbum(id) {
    return HTTPClient.get(`/album?id=${id}`, {withTimeStamp: true});
  }

  addNewList(name) {
    return HTTPClient.get(`/playlist/create?name=${name}`, {withTimeStamp: true});
  }

  updateSongList(data) {
    return HTTPClient.post(`/playlist/name/update`, data, {withTimeStamp: true});
  }
  removeSongList(id) {
    return HTTPClient.get(`/playlist/delete?id=${id}`, {withTimeStamp: true});
  }
}
export const songInfoService = new SongInfoService();
