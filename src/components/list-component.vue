<template>
    <div class="router-content">
      <div class="music-list">
        <div class="music-list-header">
          <div v-if="crtListInfo.coverImgUrl" class="music-list-img-box">
            <img class="music-list-img" :src="crtListInfo.coverImgUrl" alt="">
          </div>
          <div v-else class="music-list-img-box-empty">
            <i class="fa fa-music"></i>
          </div>
          <div class="list-infos-box">
            <div class="list-name">
              {{crtListInfo.name}}
            </div>
            <div :style="{'display': userInfo ? 'block' : 'none'}" class="user-infos-box">
              <img class="user-avatar" :src="userInfo.avatarUrl" alt="">
              <span>{{userInfo.nickname}}</span>
            </div>
            <div class="user-infos-box">
              <span>精心完善歌单信息有机会获得推荐，让更多用户看到你的大作</span>
            </div>
            <div class="btn-area">
              <a-button >
                <a-icon type="play-circle" title="播放" style="color: white" theme="outlined" />
                <span>播放全部</span>
              </a-button>
              <a-button >
                <a-icon type="download" title="下载"/>
                <span>下载</span>
              </a-button>
              <a-button >
                <a-icon type="delete" title="删除" />
                <span>删除</span>
              </a-button>
              <a-button >
                <a-icon type="menu" title="排序" />
                <span>排序</span>
              </a-button>
              <a-button v-if="!searchMode" @click="toggleSearch(true)">
                <a-icon type="search" title="搜索" />
                <span>搜索</span>
              </a-button>
              <a-input v-model="searchText" v-else>
                <a-icon slot="prefix" @click="toggleSearch(false)" type="close" />
              </a-input>
              <a-button v-if="isEditMode">
                <span>退出批量操作</span>
              </a-button>
            </div>
          </div>
        </div>
        <div class="music-list-body">
          <a-tabs default-active-key="1" @change="tabChanged(e)">
            <a-tab-pane key="1" :tab="'歌曲 ' + (songs ? songs.length : 0)">
              <a-table :pagination="false" class="song-listing" size="small" :columns="columns" :data-source="songs" :customRow="setRowBehaviour">
                <div slot="name" slot-scope="text, record, index" class="row-of-song-name" :class="currentSongIdx === index ? 'is-playing' : ''">
                  <div slot="heart" class="heart-icon" >
                    <a-icon class="blue-hover favourite-songs" type="heart"></a-icon>
                    <span :title="text.name" class="blue-hover song-name">{{ text.name }}</span>
                  </div>
                  <div class="edit-area" v-if="text.hover">
                    <a-icon class="blue-hover" type="download" title="下载"/>
                    <a-icon class="blue-hover" type="delete" title="从播放列表删除" />
                    <a-icon class="blue-hover" type="message" title="评论" />
                    <a-icon class="blue-hover" type="share-alt" title="分享" v-if="false" /><!-- todo -->
                    <a-icon class="blue-hover" type="plus-square" title="添加到" />
                  </div>
                </div>
                <span slot="singer" :title="getTitle(text)" class="row-of-singer" :class="currentSongIdx === index ? 'is-playing' : ''" slot-scope="text, record, index">
                   <span v-for="(auth, index) in text" @click="jumpToAuthorPage(auth)">
                        <span class="blue-hover">{{auth.name}}</span><span v-if="index !== text.length - 1">&nbsp;/&nbsp;</span>
                   </span>
                </span>
                <span slot="album" :title="text.name" class="blue-hover row-of-album" :class="currentSongIdx === index ? 'is-playing' : ''" slot-scope="text, record, index">{{ text.name }}</span>
              </a-table>
            </a-tab-pane>
            <a-tab-pane key="2" tab="最近收藏">
              暂无收藏
            </a-tab-pane>
            <a-tab-pane key="3" tab="评论">
              暂无评论
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </div>
</template>

<script>
  import {bully} from "./service/bully";
  import {SYSTEM_EVENTS} from "../Const";
  import {UserInfos} from "./service/user-info.service";
  import {songInfoService} from "./service/song-info.service";

  /*const renderContent = (value, row, index) => {
    const obj = {
      children: value,
      attrs: {},
    };
    if (index === 0 || index === 2) {
      obj.attrs.colSpan = 0;
    }
    return obj;
  };*/
    export default {
      name: "list-component",
      data () {
        return {
          subscription: [],
          searchMode: false,
          searchText: '',
          isEditMode: false,
          crtListInfo: {},
          crtListInfoIdx: 0,
          songs: [],
          userInfo: {},
          listInfo: {},
          currentSongIdx: 0,
          columns: [
            {
              title: '歌曲',
              dataIndex: 'rowName',
              fixed: 'left',
              width: '40%',
              scopedSlots: { customRender: 'name' }
            },
            {
              title: '歌手',
              dataIndex: 'ar',
              fixed: 'left',
              width: '28%',
              scopedSlots: { customRender: 'singer' }
            },
            {
              title: '专辑',
              dataIndex: 'al',
              fixed: 'left',
              width: '30%',
              scopedSlots: { customRender: 'album' }
            }
          ]
        }
      },
      mounted() {
        this.initCrtListInfo();
        const sub =  bully.getMessage().subscribe(res => {
          if (res.type === SYSTEM_EVENTS.GET_USER_ID) {
            this.getListInfo(res.data);
            console.log(UserInfos);
            this.userInfo = UserInfos.userInfo;
          }
          if (res.type === SYSTEM_EVENTS.CHANGE_SONG_LIST) {
            this.setCrtList(res.data);
          }
          if (res.type === SYSTEM_EVENTS.SWITCH_SONG) {
            if (res.data === 'next') {
              if (this.currentSongIdx + 1 >= this.songs.length) {
                this.$message.warning('已经是最后一首了');
                return;
              }
              this.currentSongIdx++;
              this.getListDetail();
            } else if (res.data === 'last') {
              if (this.currentSongIdx - 1 < 0) {
                this.$message.warning('已经是第一首了');
                return;
              }
              this.currentSongIdx--;
              this.getListDetail();
            } else if (res.data === 'current') {
              this.getListDetail();
            } else if (res.data === 'list loop') {
              if (this.currentSongIdx + 1 >= this.songs.length) {
                this.currentSongIdx = 0;
                this.getListDetail();
              }
            }
          }
        });
        const subR = bully.getRMessage().subscribe(res => {
          if (res.type === SYSTEM_EVENTS.SEARCH_KEYWORDS) {
            console.log(res.data);
          }
        })
        this.subscription.push(sub, subR);
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
        getTitle(data) {
          return data.map(item => item.name).join(' / ')
        },
        getListInfo(data) {
          songInfoService.getUserPlaylist(data.id).subscribe(res => {
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
          });
        },
        setRowBehaviour(data) {
          return {
            on: { // 事件
              mouseenter: () => {
                data.rowName.hover = true;
              },  // 鼠标移入行
              mouseleave: () => {
                data.rowName.hover = false;
              },
              dblclick: () => {
                this.currentSongIdx = this.songs.findIndex(item => item.id === data.id);
                console.log(this.currentSongIdx);
                this.getSongsDetail(data);
              }
            },
          };
        },
        getSongsDetail(data) {
          songInfoService.getSongDetail(data.id).subscribe(res => {
            console.log(res);
            data = {...data, ...res.data[0]};
            bully.setMessage({
              type: SYSTEM_EVENTS.PLAY_MUSIC,
              data
            })
          });
        },
        getListDetail(switchList = false) {
          if (this.songs && this.songs[this.currentSongIdx] && this.songs[this.currentSongIdx].url && !switchList) {
             this.getSongUrl();
          } else {
            songInfoService.getUserPlaylistDetail(this.crtListInfo.id).subscribe(res => {
              if (res.code === 200) {
                console.log(res);
                res.playlist.tracks.forEach(item => {
                  item.rowName = {
                    name: item.name,
                    hover: false
                  }
                });
                this.songs = res.playlist.tracks;
                console.log(this.songs);
                this.getSongUrl();
              }
            }, () => {
              this.$message.error('获取歌单详情失败')
            });
          }
        },
        getSongUrl() {
          songInfoService.getSongDetail(this.songs[this.currentSongIdx].id).subscribe(res => {
            const data = {...this.songs[this.currentSongIdx], ...res.data[0]};
            bully.setMessage({
              type: SYSTEM_EVENTS.PLAY_MUSIC,
              data: data
            })
          }, () => {
            this.$message.error('获取歌区详情失败')
          });
        },
        setCrtList(i) {
          if (this.listInfo[i]) {
            this.crtListInfo = this.listInfo[i];
            this.crtListInfoIdx = i;
            this.getListDetail(true);
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
        tabChanged(e) {},
        toggleSearch(e) {
          this.searchMode = e;
          this.searchText = '';
        },
        jumpToAuthorPage(auth) {
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
    .music-list-header{
      height: 165px;
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
        @include flex(column, space-between, flex-start);
        .list-name{
          font-size: 1.8em;
          color: $black;
          font-weight: bold;
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
          }
        }
      }
    }
    .music-list-body{
      /deep/ .ant-tabs-bar{
        border: none;
      }
      /deep/ .ant-table-row{
        user-select: none;
      }
        /deep/ .ant-table-small{
          border: none;
        }
      /deep/ .ant-table-fixed-left{
        width: $max;
        .ant-table-fixed{
          width: $max!important;
        }
      }
    }
  }
  .blue-hover{
    font-size: 1.2em;
  }
  .blue-hover:hover{
    color: $blue;
    cursor: pointer;
  }
  .is-playing{
    color: $blue;
  }
  .row-of-song-name{
    @include flex(row, space-between, center);
    width: 100%;
    max-width: 4rem;
    .heart-icon{
      @include flex(row, flex-start, center);
      width: auto;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      .song-name{
        margin-left: 10px;
      }
    }
    .edit-area{
      width: auto;
      white-space: nowrap;
    }
  }
  .row-of-singer{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    max-width: 3rem;
  }
  .row-of-album{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    max-width: 3rem;
  }

</style>
