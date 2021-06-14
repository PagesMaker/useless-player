<template>
    <div class="router-content">
      <div class="music-list">
        <div class="music-list-header" v-if="!searchMode || showHeader">
          <div v-if="crtListInfo.coverImgUrl || crtListInfo.picUrl" class="music-list-img-box">
            <img class="music-list-img" :src="crtListInfo.coverImgUrl || crtListInfo.picUrl" alt="">
          </div>
          <div v-else class="music-list-img-box-empty">
            <i class="fa fa-music"></i>
          </div>

          <div class="list-infos-box" v-if="crtHeaderType === 'playlists'">
            <div class="list-name">
              {{crtListInfo.name}}
            </div>
            <div v-if="!searchMode && showHeader" class="user-infos-box">
              <img class="user-avatar" :src="userInfo.avatarUrl" alt="">
              <span>{{userInfo.nickname}}</span>
            </div>
            <div v-else-if="searchMode && showHeader" class="user-infos-box">
              <img class="user-avatar" :src="crtListInfo && crtListInfo.creator && crtListInfo.creator.avatarUrl" alt="">
              <span>{{crtListInfo && crtListInfo.creator && crtListInfo.creator.nickname}}</span>
            </div>
            <div class="user-infos-box">
              <span>{{(crtListInfo && crtListInfo.description) || '精心完善歌单信息有机会获得推荐，让更多用户看到你的大作'}}</span>
            </div>
            <div class="btn-area">
              <a-button @click="getListDetail(false, true)">
                <a-icon type="play-circle" title="播放" style="color: white" theme="outlined" />
                <span>播放全部</span>
              </a-button>
              <a-button v-if="!searchInList" @click="toggleSearch(true)">
                <a-icon type="search" title="搜索" />
                <span>搜索</span>
              </a-button>
              <a-input v-model="searchText" class="search-in-list" v-else @change="searchSongInList()" @blur="getSearchResultFromList()" @keypress.enter="getSearchResultFromList()">
                <a-icon slot="prefix" @click="toggleSearch(false)" type="close" />
              </a-input>
              <a-button v-if="isEditMode">
                <span>退出批量操作</span>
              </a-button>
            </div>
          </div>

          <div v-else-if="crtHeaderType === 'albums'" class="list-infos-box">
            <div class="list-name">
              {{crtListInfo.name}}
            </div>
            <div class="list-information">
             <span v-for="(auth, index) in (crtListInfo.ar || crtListInfo.artists)">
               <span>{{auth.name}}</span><span v-if="index !== (crtListInfo.ar || crtListInfo.artists).length - 1">&nbsp;/&nbsp;</span>
            </span>
            </div>
            <div class="list-information">
              <span>发布时间：{{crtListInfo.publishTime | dateFormat('yyyy-MM-DD')}}</span><span style="margin-left: 2em">发行方：{{crtListInfo.company}}</span>
            </div>
            <div class="user-infos-box">
              <span>{{(crtListInfo && crtListInfo.description) || '精心完善歌单信息有机会获得推荐，让更多用户看到你的大作'}}</span>
            </div>
            <div class="btn-area">
              <a-button @click="getListDetail(false, true)">
                <a-icon type="play-circle" title="播放" style="color: white" theme="outlined" />
                <span>播放全部</span>
              </a-button>
              <a-button v-if="!searchInList" @click="toggleSearch(true)">
                <a-icon type="search" title="搜索" />
                <span>搜索</span>
              </a-button>
              <a-input v-model="searchText" class="search-in-list" v-else @change="searchSongInList()" @blur="getSearchResultFromList()" @keypress.enter="getSearchResultFromList()">
                <a-icon slot="prefix" @click="toggleSearch(false)" type="close" />
              </a-input>
              <a-button v-if="isEditMode">
                <span>退出批量操作</span>
              </a-button>
            </div>
          </div>

          <div v-else-if="crtHeaderType === 'ranklist'" class="list-infos-box">
            <div class="list-name">
              {{crtListInfo.name}}
            </div>
            <div class="list-information">
              <span>更新时间：{{crtListInfo.updateTime | dateFormat('yyyy-MM-DD')}}</span>
            </div>
            <div class="btn-area">
              <a-button @click="getListDetail(false, true)">
                <a-icon type="play-circle" title="播放" style="color: white" theme="outlined" />
                <span>播放全部</span>
              </a-button>
              <a-button v-if="!searchInList" @click="toggleSearch(true)">
                <a-icon type="search" title="搜索" />
                <span>搜索</span>
              </a-button>
              <a-input v-model="searchText" class="search-in-list" v-else @change="searchSongInList()" @blur="getSearchResultFromList()" @keypress.enter="getSearchResultFromList()">
                <a-icon slot="prefix" @click="toggleSearch(false)" type="close" />
              </a-input>
              <a-button v-if="isEditMode">
                <span>退出批量操作</span>
              </a-button>
            </div>
          </div>
        </div>
        <div class="music-list-body">
          <table-in-list
            :currentListPlaying="crtListInfoIdx === playingListIdx"
            :crtListInfo="crtListInfo"
            :search-mode="searchMode"
            :songs="searchMode ? currentSearchData : songs"
            :currentSongIdx="currentSongIdx"
            :columns="searchMode ? searchListingColumns : columns"
            @hoverInRow="rowHover($event)"
            @changeCurrentSongIdx="getSongsDetail($event)"
            :isPlaySearchSong="isPlaySearchSong"
            @handleTableChange="handleTableChange($event)"
            @scrollToBottom="getMoreSearchResult()"
          ></table-in-list>
        </div>
      </div>
    </div>
</template>

<script>
  import {bully} from "./service/bully";
  import {SYSTEM_EVENTS} from "../Const";
  import {UserInfos} from "./service/user-info.service";
  import {songInfoService} from "./service/song-info.service";
  import tableInList from "./table-in-list";
  import {Subject} from "rxjs";
  import {debounceTime} from "rxjs/operators";
  import {PY} from "../assets/ChinesePY";

  export default {
      name: "list-component",
      components: {
        tableInList
      },
      data () {
        return {
          subscription: [],
          searchMode: false,
          showHeader: true,
          searchInList: false,
          searchText: '',
          isEditMode: false,
          searchText$: new Subject(),
          crtListInfo: {},
          playingListIdx: 0,
          crtHeaderType: 'playlists',
          crtListInfoIdx: 0,
          songs: [],
          currentSearchData: [],
          userInfo: {},
          listInfo: {},
          hasMore: false,
          isPlaySearchSong: false,
          currentSongIdx: 0,
          searchListingColumns: [
            {
              title: '歌曲',
              dataIndex: 'rowName',
              fixed: 'left',
              width: '40%',
              ellipsis: true,
              scopedSlots: { customRender: 'name' }
            },
            {
              title: '歌手',
              dataIndex: 'artists',
              fixed: 'left',
              width: '25%',
              ellipsis: true,
              scopedSlots: { customRender: 'singer' }
            },
            {
              title: '专辑',
              dataIndex: 'album',
              fixed: 'left',
              width: '25%',
              ellipsis: true,
              scopedSlots: { customRender: 'album' }
            },
            {
              title: '时长',
              dataIndex: 'duration',
              fixed: 'left',
              width: '10%',
              ellipsis: true,
              scopedSlots: { customRender: 'time' }
            }
          ],
          columns: [
            {
              title: '歌曲',
              dataIndex: 'rowName',
              fixed: 'left',
              width: '40%',
              scopedSlots: { customRender: 'name' },
              sorter: true,
              sortDirections: ['descend', 'ascend']
            },
            {
              title: '歌手',
              dataIndex: 'ar',
              fixed: 'left',
              width: '28%',
              scopedSlots: { customRender: 'singer' },
              sorter: true,
              sortDirections: ['descend', 'ascend']
            },
            {
              title: '专辑',
              dataIndex: 'al',
              fixed: 'left',
              width: '30%',
              scopedSlots: { customRender: 'album' },
              sorter: true,
              sortDirections: ['descend', 'ascend']
            }
          ]
        }
      },
      mounted() {
        this.initCrtListInfo();
        const s = this.searchText$.asObservable().pipe(debounceTime(400)).subscribe(() => {
          this.getSearchResultFromList();
        });
        if (UserInfos.userInfo.id) {
          console.log(UserInfos);
          this.userInfo = UserInfos.userInfo;
          this.getListInfo(UserInfos.userInfo);
        }
        const sub =  bully.getMessage().subscribe(res => {
          if (res.type === SYSTEM_EVENTS.GET_USER_ID) {
            this.getListInfo(res.data);
            this.userInfo = UserInfos.userInfo;
          }
          if (res.type === SYSTEM_EVENTS.CHANGE_SONG_LIST) {
            this.setCrtList(res.data.idx, res.data.playSong);
          }
          if (res.type === SYSTEM_EVENTS.GOT_SONG_LIST_FROM_BACKEND) {
            this.listInfo = res.data;
            this.setCrtList(0);
          }
          if (res.type === SYSTEM_EVENTS.SONG_LIST_REFRESH) {
            if (this.searchMode) {
              return;
            }
            this.listInfo = res.data;
            this.setCrtList(this.crtListInfoIdx);
            if (res.exData) {
              bully.setMessage({
                type: SYSTEM_EVENTS.SWITCH_AFTER_REMOVE_SONG,
                data: res.exData
              })
            }
          }
          if (res.type === SYSTEM_EVENTS.GET_SONG_URL) {
            this.getSongUrl();
          }
          if (res.type === SYSTEM_EVENTS.SWITCH_SONG) {
            if (res.data.type === 'next') {
              if (this.currentSongIdx + 1 >= (this.searchMode ? this.currentSearchData.length : this.songs.length)) {
                this.$message.warning('已经是最后一首了');
                return;
              }
              if (res.data.switchSong) {
                this.currentSongIdx++;
              }
              this.searchMode && this.isPlaySearchSong ? this.getSongsDetail() : this.getListDetail();
            } else if (res.data.type === 'prev') {
              if (this.currentSongIdx - 1 < 0) {
                this.$message.warning('已经是第一首了');
                return;
              }
              this.currentSongIdx--;
              this.searchMode && this.isPlaySearchSong? this.getSongsDetail() : this.getListDetail();
            } else if (res.data.type === 'current') {
              this.searchMode && this.isPlaySearchSong ? this.getSongsDetail() : this.getListDetail();
            } else if (res.data.type === 'list loop') {
              if (this.currentSongIdx + 1 >= (this.searchMode ? this.currentSearchData.length : this.songs.length)) {
                this.currentSongIdx = 0;
                this.searchMode && this.isPlaySearchSong ? this.getSongsDetail() : this.getListDetail();
              }
            }
          }
        });
        const subR = bully.getRMessage().subscribe(res => {
          if (res.type === SYSTEM_EVENTS.SEARCH_KEYWORDS) {
            console.log(res.data);
            this.currentSearchData = res.data.data[res.data.type];
            // this.currentSongIdx = -1;
            this.searchMode = true;
            this.showHeader = false;
            this.hasMore = res.data.data.hasMore;
            if (res.data.type === 'album') {
            } else {
            }
          }
          if (res.type === SYSTEM_EVENTS.MULTI_PURPOSE_HANDLE) {
            console.log(res.data);
           if (res.data && (res.data.targetId || res.data.id)) {
             switch (res.data.type) {
               case 'albums' : {
                 songInfoService.getAlbum(res.data.targetId || res.data.id).subscribe(response => {
                   if (response.code === 200) {
                     if (!response.songs) {
                       return;
                     }
                     this.searchMode = true;
                     this.showHeader = true;
                     this.crtHeaderType  = res.data.type;
                     this.currentSearchData = response.songs.map(item => (
                       {...item, artists: item.ar, album: item.al, duration: item.dt, rowName: {
                           name: item.name,
                           hover: false
                         }
                       })
                     );
                     this.crtListInfo = response.album;
                   } else {
                     this.$message.error('获取歌单详情失败')
                   }
                 }, () => {
                   this.$message.error('获取歌单详情失败')
                 });
                 break;
               }
               case 'playlists' : {
                 songInfoService.getPlaylistDetail(res.data.targetId || res.data.id).subscribe(response => {
                   if (response.code === 200) {
                     console.log(response);
                     if (!response.playlist) {
                       return;
                     }
                     this.searchMode = true;
                     this.showHeader = true;
                     this.crtHeaderType  = res.data.type;
                     this.currentSearchData = response.playlist.tracks.map(item => (
                       {...item, artists: item.ar, album: item.al, duration: item.dt, rowName: {
                           name: item.name,
                           hover: false
                         }
                       })
                     );
                     this.crtListInfo = response.playlist;
                   } else {
                     this.$message.error('获取歌单详情失败')
                   }
                 }, () => {
                   this.$message.error('获取歌单详情失败')
                 });
                 break;
               }
               case 'ranklist' : {
                 songInfoService.getPlaylistDetail(res.data.targetId || res.data.id).subscribe(response => {
                   if (response.code === 200) {
                     console.log(response);
                     if (!response.playlist) {
                       return;
                     }
                     this.searchMode = true;
                     this.showHeader = true;
                     this.crtHeaderType  = res.data.type;
                     this.currentSearchData = response.playlist.tracks.map(item => (
                       {...item, artists: item.ar, album: item.al, duration: item.dt, rowName: {
                           name: item.name,
                           hover: false
                         }
                       })
                     );
                     this.crtListInfo = response.playlist;
                   } else {
                     this.$message.error('获取歌单详情失败')
                   }
                 }, () => {
                   this.$message.error('获取歌单详情失败')
                 });
                 break;
               }
             }
           }
          }
        })
        this.subscription.push(sub, subR, s);
      },
      destroyed() {
        for (const ite of this.subscription) {
          if (ite) {
            ite.unsubscribe();
          }
        }
        this.subscription = null;
      },
      methods: {
        getListInfo(data) {
          bully.setMessage({
            type: SYSTEM_EVENTS.GET_SONG_LIST,
            data: {
              fromCache: false,
              data
            }
          })
          /*songInfoService.getUserPlaylist(data.id).subscribe(res => {
            console.log(res);
            if (res.code === 200) {
              this.listInfo = res.playlist;
              bully.setMessage({
                type: SYSTEM_EVENTS.SYNC_LIST,
                data: this.listInfo
              })
              this.setCrtList(0);
            }
          }, () => {
            this.$message.error('获取用户歌单失败');
          });*/
        },
        rowHover(e) {
          !this.searchMode ? (this.songs[e.idx].rowName.hover = e.hover) : (this.currentSearchData[e.idx].rowName.hover = e.hover);
        },
        getSongsDetail(data = this.currentSearchData[this.currentSongIdx]) {
          if (!this.searchMode) {
            this.currentSongIdx = this.songs.findIndex(item => item.id === data.id);
            this.getSongUrl();
            return;
          }
          songInfoService.getAlbum(data.album.id).subscribe(res => {
            if (res.code === 200) {
              data.al = res.album;
              data.ar = data.artists;
              data.dt = data.duration;
              this.currentSongIdx = this.currentSearchData.findIndex(item => item.id === data.id);
              console.log(this.currentSongIdx);
              songInfoService.getSongUrl(data.id).subscribe(res => {
                console.log(res);
                data = {...data, ...res.data[0]};
                bully.setMessage({
                  type: SYSTEM_EVENTS.PLAY_MUSIC,
                  data
                });
                this.playingListIdx = this.crtListInfoIdx;
                this.isPlaySearchSong = true;
              });
            }
          });
        },
        getListDetail(switchList = false, playSong = false, param) {
          if (this.songs && this.songs[this.currentSongIdx] && this.songs[this.currentSongIdx].url && !switchList) {
             this.getSongUrl();
          } else {
            songInfoService.getPlaylistDetail(this.crtListInfo.id).subscribe(res => {
              if (res.code === 200) {
                res.playlist.tracks.forEach(item => {
                  item.rowName = {
                    name: item.name,
                    hover: false
                  }
                });
                if (param && param.sorter.order === 'ascend') {
                  const field = param.sorter.field;
                  this.songs = res.playlist.tracks.sort((a ,b) => this.compare(a[field].name || a[field][0].name, b[field].name || b[field][0].name) ? 1 : -1).map(item => {item.hidden = false; return item});
                } else if (param && param.sorter.order === 'descend') {
                  const field = param.sorter.field;
                  this.songs = res.playlist.tracks.sort((a ,b) => this.compare(a[field].name || a[field][0].name, b[field].name || b[field][0].name) ? -1 : 1).map(item => {item.hidden = false; return item});
                } else {
                  this.songs = res.playlist.tracks.map(item => {item.hidden = false; return item});
                }
                if (!switchList || playSong) {
                  this.getSongUrl();
                }
              }
            }, () => {
              this.$message.error('获取歌单详情失败')
            });
          }
        },
        compare(a, b) {
          if (PY.getWordsCode(a)) {
            a = PY.getWordsCode(a);
          }
          if (PY.getWordsCode(b)) {
            b = PY.getWordsCode(b);
          }
          return a > b;
        },
        getMoreSearchResult() {

        },
        handleTableChange(e) {
          console.log(e);
          // 暂时将该函数认为是sort的回调，因为翻页和筛选功能暂时不会去做
          this.getListDetail(true, false, e);
        },
        getSongUrl() {
          if (!this.songs.length) {
            return;
          }
          songInfoService.getSongUrl(this.songs[this.currentSongIdx].id).subscribe(res => {
            this.playingListIdx = this.crtListInfoIdx;
            const data = {...this.songs[this.currentSongIdx], ...res.data[0], crtListId: this.crtListInfo.id};
            bully.setMessage({
              type: SYSTEM_EVENTS.PLAY_MUSIC,
              data: data
            });
            this.isPlaySearchSong = false;
          }, () => {
            this.$message.error('获取歌曲详情失败')
          });
        },
        setCrtList(i, playSong = false) {
          if (this.searchMode) {
            this.showHeader = true;
            this.searchMode = false;
            this.currentSongIdx = 0;
            this.crtHeaderType  = 'playlists';
          }
          if (this.listInfo[i]) {
            this.crtListInfo = this.listInfo[i];
            this.crtListInfoIdx = i;
            this.getListDetail(true, playSong);
          } else {
            this.initCrtListInfo();
          }
        },
        initCrtListInfo() {
          this.crtListInfo = {
            name: '新建歌单',
            coverImgUrl: ''
          }
        },
        toggleSearch(e) {
          this.searchInList = e;
          this.searchText = '';
        },
        searchSongInList() {
          this.searchText$.next();
        },
        getSearchResultFromList() {
            for (const item of this.songs) {
              item.hidden = !(item.name.toLowerCase().includes(this.searchText.toLowerCase()) || (item.al && typeof item.al.name === 'string' && item.al.name.toLowerCase().includes(this.searchText.toLowerCase())) || (item.ar.length && item.ar.find(i => i.name.toLowerCase().includes(this.searchText.toLowerCase()))));
            }
          }
      }
    }
</script>

<style lang="scss" scoped>
  .music-list{
    width: $max;
    height: $max;
    overflow: auto;
    /deep/ .ant-table-fixed-left, .ant-table-fixed-right{
      z-index: 0!important;
    }
    /deep/ .anticon {
      font-size: 1.2em;
    }
    /deep/ .ant-tabs-content{
      min-height: 400px;
    }
    .music-list-header{
      min-height: 165px;
      height: auto;
      width: $max;
      @include flex(row, flex-start, center);
      .music-list-img-box{
        width: 165px;
        height: $max;
        border-radius: 20px;
        display: flex;
        >img.music-list-img{
          width: inherit;
          height: inherit;
          border-radius: inherit;
        }
      }
      .music-list-img-box-empty{
        width: 165px;
        height: $max;
        border-radius: 20px;
        background-color: $blue;
        color: $white;
        font-size: 96px;
        >i{
          margin-left: 32px;
        }
      }
      .list-infos-box{
        margin-left: 20px;
        height: $max;
        width: auto;
        max-width: $max;
        overflow: auto;
        @include flex(column, space-between, flex-start);
        .list-name{
          font-size: 1.8em;
          color: $black;
          font-weight: bold;
        }
        /deep/ .ant-input:focus{
          border: none;
          box-shadow: unset;
        }
        >div {
          padding: 3px 0;
        }
        .user-infos-box{
          color: $black;
          @include flex(row, flex-start, center);
          .user-avatar{
            width: 30px;
            height: 30px;
            border-radius: 30px;
          }
          .user-avatar + span{
            margin-left: 10px;
          }
          .user-avatar + span:hover{
            color: $blue;
            cursor: pointer;
          }
        }
        .btn-area{
          :not(:first-child){
            margin-left: 10px;
          }
          @include flex(row, unset, center);
          /deep/ .ant-input-affix-wrapper{
            border: none;
            width: 150px;
            border-radius: 20px;
            background-color: $gray;
            .ant-input{
              border: none;
              border-radius: 20px;
              width: 150px;
              background-color: $gray;
              :focus{
                box-shadow: none;
              }
            }
          }
          /deep/ .ant-btn:first-child{
            background-color: $blue;
            color: $white;
          }
          /deep/ .ant-btn{
            border: none;
            width: 110px;
            border-radius: 20px;
            background-color: $gray;
          }
          /deep/ .ant-btn:first-child:hover{
            background-color: $deepBlue;
            color: $white;
          }
          /deep/ .ant-btn:hover{
            color: unset;
            background-color: #aaaaaa;
            .anticon {
              color: rgba(0, 0, 0, 0.65)
            }
          }
          /deep/ .ant-btn:active{
            color: unset;
          }
          /deep/ .ant-btn:focus{
            color: unset;
          }
        }
      }
    }
  }

</style>
