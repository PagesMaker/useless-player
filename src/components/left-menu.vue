<template>
  <div class="left-menu-content">
    <div class="title">
      <span>useless player</span>
    </div>
    <a-menu
      :default-selected-keys="[8]"
      :open-keys.sync="openKeys"
      mode="inline"
      :selectedKeys="selectedKeys"
      @click="handleClick"
    >
      <a-sub-menu key="sub1" @titleClick="titleClick">
        <span slot="title"><span>在线音乐</span></span>
          <a-menu-item key="1">
              <a-icon type="customer-service" />音乐馆
          </a-menu-item>
          <a-menu-item key="2">
              <a-icon type="video-camera" />视频
          </a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="sub2" @titleClick="titleClick">
        <span slot="title"><span>我的音乐</span></span>
        <a-menu-item key="5">
          <a-icon type="star" />我喜欢
        </a-menu-item>
        <a-menu-item key="6">
          <a-icon type="history" />播放历史
        </a-menu-item>
        <a-menu-item key="7">
          <a-icon type="menu" />试听列表
        </a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="sub3">
        <span slot="title"><span>我的歌单</span></span>
        <a-menu-item @click="selectSongList(index)" :key="8 + index" v-for="(songList, index) in songLists">
          {{songList.name}}
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </div>
</template>

<script>
  import {bully} from "./service/bully";
  import {SYSTEM_EVENTS} from "../Const";
  import {songInfoService} from "./service/song-info.service";

  export default {
    name: "left-menu",
    data() {
      return {
        openKeys: ['sub1', 'sub2', 'sub3'],
        songLists: [],
        subscription: [],
        selectedKeys: [0],
        uid: 0
      };
    },
    mounted() {
      const sub =  bully.getMessage().subscribe(res => {
        if (res.type === SYSTEM_EVENTS.GET_SONG_LIST) {
          if (res.data.fromCache) {
            bully.setMessage({
              type: SYSTEM_EVENTS.SONG_LIST_REFRESH,
              data: this.songLists
            })
          } else {
            this.uid = res.data.data.id;
            this.getList(SYSTEM_EVENTS.GOT_SONG_LIST_FROM_BACKEND);
          }
        }
        if (res.type === SYSTEM_EVENTS.ADD_TO_NEW_SONG_LIST) {
          // todo
        }
        if (res.type === SYSTEM_EVENTS.ADD_TO_SONG_LIST) {
          songInfoService.songListEdit(
            res.data
          ).subscribe(res => {
            console.log(res);
            if (res.body.code === 200) {
              this.getList(SYSTEM_EVENTS.SONG_LIST_REFRESH);
            }
          })
        }
      })
      const rsub = bully.getRMessage().subscribe(res => {
        if (res.type ===  SYSTEM_EVENTS.SEARCH_KEYWORDS) {
          this.selectedKeys = [0];
        }
      })
      this.subscription.push(sub, rsub);
    },
    destroyed() {
      for (const ite of this.subscription) {
        if (ite) {
          ite.unsubscribe();
        }
      }
      this.subscription = null;
    },
    watch: {
      openKeys(val) {
        console.log('openKeys', val);
      },
    },
    methods: {
      getList(type) {
        songInfoService.getUserPlaylist(this.uid).subscribe(res => {
          console.log(res);
          if (res.code === 200) {
            this.songLists = res.playlist;
            this.selectedKeys = [8];
            bully.setMessage({
              type,
              data: this.songLists
            });
          }
        }, () => {
          this.$message.error('获取用户歌单失败');
        });
      },
      handleClick(e) {
        console.log('click', e);
        this.selectedKeys = [e.key];
      },
      titleClick(e) {
        console.log('titleClick', e);
      },
      selectSongList(idx) {
        bully.setMessage({
          type: SYSTEM_EVENTS.CHANGE_SONG_LIST,
          data: idx
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .left-menu-content{
    background-color: #F6F6F6;
     /deep/ .ant-menu.ant-menu-inline{
      background: #F6F6F6;
    }
  }
  .title{
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    width: 100%;
    text-align: center;
    line-height: 60px;
    font-size: 26px;
  }
</style>
