<template>
    <div class="music-list">
      <div class="music-list-header">
        <div class="list-name">
          最近播放
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
      <div class="music-list-body">
        <table-in-list
          :from="'played-music-list'"
          :availableTabs="['song', 'album', 'video', 'playlist']"
          :crtListInfo="crtListInfo"
          :search-mode="false"
          :songs="songs"
          :currentSongIdx="currentSongIdx"
          :columns="columns"
          @hoverInRow="rowHover($event)"
          @changeCurrentSongIdx="getSongsDetail($event)"
          :isPlaySearchSong="false"
          @handleTableChange="handleTableChange($event)"
          @scrollToBottom="getMoreSearchResult()"
        ></table-in-list>
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
    name: "played-music-list",
    components: {
      tableInList
    },
    data () {
      return {
        subscription: [],
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
        userInfo: {},
        listInfo: {},
        currentSongIdx: 0
      }
    },
    props: ['columns'],
    mounted() {
      this.initCrtListInfo();
      const s = this.searchText$.asObservable().pipe(debounceTime(400)).subscribe(() => {
        this.getSearchResultFromList();
      });
      /*if (UserInfos.userInfo.id) {
        console.log(UserInfos);
        this.userInfo = UserInfos.userInfo;
        this.getListInfo(UserInfos.userInfo);
      }*/
      const sub = bully.getMessage().subscribe(res => {
        // if (res.type === SYSTEM_EVENTS.GET_USER_ID) {
        //   this.getListInfo(res.data);
        //   this.userInfo = UserInfos.userInfo;
        // }
        if (res.type === SYSTEM_EVENTS.CHANGE_SONG_LIST) {
          this.setCrtList(res.data.idx, res.data.playSong);
        }
        if (res.type === SYSTEM_EVENTS.GOT_SONG_LIST_FROM_BACKEND) {
          this.listInfo = res.data;
          this.setCrtList(0);
        }
        if (res.type === SYSTEM_EVENTS.SONG_LIST_REFRESH) {
          this.listInfo = res.data;
          this.setCrtList(this.crtListInfoIdx);
          if (res.exData) {
            bully.setMessage({
              type: SYSTEM_EVENTS.SWITCH_AFTER_REMOVE_SONG,
              data: res.exData
            })
          }
        }
        if (res.type === SYSTEM_EVENTS.SONG_LIST_REFRESH_BY_GET_LIST) {
          this.favoriteListData.songs = res.data[0];
        }
        if (res.type === SYSTEM_EVENTS.GET_SONG_URL) {
          this.getSongUrl();
        }
        if (res.type === SYSTEM_EVENTS.SWITCH_SONG) {
          if (res.data.type === 'next') {
            if (this.currentSongIdx + 1 >= this.songs.length) {
              this.$message.warning('已经是最后一首了');
              return;
            }
            if (res.data.switchSong) {
              this.currentSongIdx++;
            }
            this.getListDetail();
          } else if (res.data.type === 'prev') {
            if (this.currentSongIdx - 1 < 0) {
              this.$message.warning('已经是第一首了');
              return;
            }
            this.currentSongIdx--;
            this.getListDetail();
          } else if (res.data.type === 'current') {
            this.getListDetail();
          } else if (res.data.type === 'list loop') {
            if (this.currentSongIdx + 1 >= this.songs.length) {
              this.currentSongIdx = 0;
              this.getListDetail();
            }
          }
        }
      });
      this.subscription.push(sub, s);
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
      rowHover(e) {
        this.songs[e.idx].rowName.hover = e.hover;
      },
      getSongsDetail(data) {
        this.currentSongIdx = this.songs.findIndex(item => item.id === data.id);
        this.getSongUrl();
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
          bully.setMessage({
            type: SYSTEM_EVENTS.SET_PLAYING_LIST,
            data: {
              type: 'played-music-list',
              data: this.songs
            }
          });
        }, () => {
          this.$message.error('获取歌曲详情失败')
        });
      },
      setCrtList(i, playSong = false) {
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
      min-height: 120px;
      height: auto;
      width: $max;
      @include flex(column, space-between, flex-start);
      .list-name{
        font-weight: 800;
        font-size: 2em;
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

</style>

