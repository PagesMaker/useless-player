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
                <a-icon type="play-circle" title="播放" theme="outlined" />
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
              <a-table :pagination="false" class="song-listing" size="small"  :columns="columns" :data-source="songs">
                <div slot="name" slot-scope="text" class="row-of-song-name">
                  <span slot="heart" class="blue-hover heart-icon" > <a-icon class="favourite-songs" type="heart"></a-icon></span>
                  <span class="song-name">{{ text }}</span>
                  <span class="edit-area blue-hover">
                    <a-icon type="download" title="下载"/>
                    <a-icon type="delete" title="从播放列表删除" />
                    <a-icon type="message" title="评论" />
                    <a-icon type="share-alt" title="分享" v-if="false" /><!-- todo -->
                    <a-icon type="plus-square" title="添加到" />
                  </span>
                </div>
                <span slot="singer" slot-scope="ar">
                   <span v-for="(auth, index) in ar" @click="jumpToAuthorPage(auth)">
                        <span class="blue-hover">{{auth.name}}</span><span v-if="index !== ar.length - 1">&nbsp;/&nbsp;</span>
                   </span>
                </span>
                <span slot="album" class="blue-hover" slot-scope="al">{{ al.name }}</span>
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
  import {SERVER} from "../main";
  import {UserInfos} from "./service/user-info.service";

  const renderContent = (value, row, index) => {
    const obj = {
      children: value,
      attrs: {},
    };
    if (index === 0 || index === 2) {
      obj.attrs.colSpan = 0;
    }
    return obj;
  };
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
          columns: [
            {
              title: '歌曲',
              dataIndex: 'name',
              width: 360,
              ellipsis: true,
              scopedSlots: { customRender: 'name' }
            },
            {
              title: '歌手',
              dataIndex: 'ar',
              width: 240,
              scopedSlots: { customRender: 'singer' }
            },
            {
              title: '专辑',
              dataIndex: 'al',
              width: 240,
              scopedSlots: { customRender: 'album' }
            }
          ]
        }
      },
      mounted() {
        this.initCrtListInfo();
        const sub =  bully.getMessage().subscribe(res => {
          console.log(res, 1111);
          if (res.type === SYSTEM_EVENTS.GET_USER_ID) {
            this.getListInfo(res.data);
            console.log(UserInfos);
            this.userInfo = UserInfos.userInfo;
          }
        })
        this.subscription.push(sub);
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
          this.axios.post(SERVER + `/user/playlist`, {
            cookie: UserInfos.cookie,
            uid: data.id
          }).then(res => {
            console.log(res);
            if (res.data.code === 200) {
              this.listInfo = res.data.playlist;
              this.setCrtList(0);
              this.getListDetail();
            }
          }, err => {
            console.log(err);
          })
        },
        getListDetail() {
          this.axios.get(SERVER + `/playlist/detail?id=${this.crtListInfo.id}&cookie=${UserInfos.cookie}`).then(res =>{
            console.log(res);
            res.data.playlist.tracks.forEach(item => {
              item.musicSrc = this.getMusic(item.id);
            });
            this.songs = res.data.playlist.tracks;
          }, err => {
            console.log(err);
          })
        },
        setCrtList(i) {
          if (this.listInfo[i]) {
            this.crtListInfo = this.listInfo[i];
            this.crtListInfoIdx = i;
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
        getMusic(musicId) {
          return `https://music.163.com/song/media/outer/url?id=${musicId}.mp3`
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
    /deep/ .anticon {
      font-size: 1.2em;
    }
    .music-list-header{
      height: 165px;
      width: $max;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
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
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-between;
        .list-name{
          font-size: 0.2rem;
          color: $black;
          font-weight: bold;
        }
        .user-infos-box{
          color: $black;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
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
          display: flex;
          flex-direction: row;
          align-items: center;
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
        /deep/ .ant-table-small{
          border: none;
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
</style>
