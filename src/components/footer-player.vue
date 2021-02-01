<template>
  <div class="footer-player-content-box">
    <div class="process-bar"></div>
    <div class="song-area">
      <div class="song-info">
        <div v-if="songInfo.al.picUrl !== ''" class="song-image">
          <img :src="songInfo.al.picUrl" alt="">
        </div>
        <div class="song-image blue-bg" style="opacity: 0.7" v-else>
          <a-icon type="customer-service" />
        </div>
        <div class="song-name-area">
          <div class="song-name-content">
            <span class="song-name">{{songInfo.name}}</span>
            <span>&nbsp;-&nbsp;</span>
            <span v-for="(auth, index) in songInfo.ar" @click="jumpToAuthorPage(auth)">
            <span>{{auth.name}}</span><span v-if="index !== songInfo.ar.length - 1">&nbsp;/&nbsp;</span>
          </span>
          </div>
          <div class="function-area">
<!--            <a-icon type="heart" title="我喜欢" :theme="songInfo.isLikeHover ? 'filled': 'outlined'" :style="{'color' : songInfo.isLike ? 'red' : 'rgba(0, 0, 0, 0.65)'}" />-->
            <a-icon type="download" title="下载"/>
            <a-icon type="delete" title="从播放列表删除" />
            <a-icon type="message" title="评论" />
            <a-icon type="share-alt" title="分享" v-if="false" /><!-- todo -->
            <a-icon type="plus-square" title="添加到" />
            <div class="add-to-song-list" v-if="addToSongListShow"></div>
          </div>
        </div>
      </div>
      <div class="center-control-area">
        <a-icon v-if="musicControl.playMode === 'list loop'" type="sync" title="列表循环" />
        <a-icon v-if="musicControl.playMode === 'list'" type="ordered-list" title="列表播放" />
        <div v-if="musicControl.playMode === 'single'" class="single-song-loop"><a-icon type="sync" title="单曲循环"/><span>1</span></div>
        <a-icon type="step-backward" title="上一首"/>
        <a-icon v-if="!musicControl.isPlaying" type="play-circle" title="播放" theme="filled" />
        <a-icon v-if="musicControl.isPlaying" type="pause-circle" title="暂停" theme="filled" />
        <a-icon type="step-forward" title="下一首"/>
        <a-icon type="sound"  title="音量"/>
        <div class="adjust-sound" v-if="musicControl.openSoundAdjustPanel"></div>
      </div>
      <div class="right-control-area">
        <div class="time-area">
          <span>{{currentTime | timeFormat('mm:ss')}}</span> <span>&nbsp;/&nbsp;</span> <span>{{getSongTime | timeFormat('mm:ss')}}</span>
        </div>
        <div class="list-area">
          <a-icon type="menu" title=""/>
        </div>
      </div>
    </div>
    <audio :src="songInfo.musicSrc" ref="mainPlayer" preload="auto"  id="mainPlayer"></audio>
  </div>
</template>

<script>

  import {bully} from "./service/bully";
  import {SYSTEM_EVENTS} from "../Const";

  export default {
    name: 'footer-player',
    data() {
      return {
        addToSongListShow: false,
        currentTime: 999,
        musicControl: {
          playMode: 'list', // 可能的类型，列表播放list，单曲循环single，列表循环list loop
          openSoundAdjustPanel: false
        },
        subscription: [],
        songInfo: {
          musicSrc: '',
          al: {
            picUrl: ''
          },
          name: 'music',
          ar: [{
            name: ''
          }],
          dt: 0
        },
        songList: []
      }
    },
    methods:{
      jumpToAuthorPage(author) {
        console.log(author);
      },
      openPlayerWindow() {

      },
      play() {
        console.log(this.songInfo.musicSrc);
        this.$refs.mainPlayer.play();
      },
      pause() {
        this.$refs.mainPlayer.pause();
      }
    },
    computed:{
      getSongTime() {
        return !this.songInfo.dt ? '00:00' : this.songInfo.dt
      }
    },
    mounted() {
      const sub = bully.getMessage().subscribe(res => {
        if (res.type === SYSTEM_EVENTS.PLAY_MUSIC) {
          if (!this.$refs.mainPlayer.paused) {
            this.pause();
            const beforeSrc = this.$refs.mainPlayer.src;
            this.songInfo.musicSrc = '';
            if (res.data.musicSrc === beforeSrc) {
              return;
            }
          }
          this.songInfo = JSON.parse(JSON.stringify(res.data));
          setTimeout(() => {
            if (this.$refs.mainPlayer.paused && this.songInfo.musicSrc !== '') {
              // 暂停
              this.play();
            }
          }, 200);
        }
      });
      this.subscription.push(sub);
    },
    destroyed() {
      for (const ite of this.subscription) {
        if (ite) {
          ite.unsubscribe();
        }
      }
      this.subscription = null;
    }
  }
</script>

<style lang="scss" scoped>

  .footer-player-content-box{
    width: $max;
    /deep/ .anticon {
      font-size: 1.2em;
    }
    .process-bar{
      width: $max;
      height: 2px;
      background-color: $gray;
    }
    .song-area{
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      padding: 5px 20px;
      width: $max;
      >div{
        width: $p33;
        height: $max;
        display: flex;
      }
      .song-info{
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        .song-name-area{
          margin: 0 10px;
          /deep/ .anticon:not(:first-child) {
            padding: 0 3px;
          }
          .song-name-content{
            .song-name{
              color: black;
              font-size: 16px;
              font-weight: 500;
            }
          }
        }
        .song-image{
          width: 40px;
          color: #E3E3E3;
          height: 40px;
          border-radius: 5px;
          font-size: 2em;
          display: flex;
          justify-content: center;
          align-items: center;
          img{
            width: $max;
            height: $max;
          }
        }
      }
      .center-control-area{
        flex-direction: row;
        align-items: center;
        justify-content: center;
        /deep/ .anticon.anticon-step-backward, .anticon.anticon-step-forward {
          font-size: 2em;
          margin: 0 10px;
        }
        /deep/ .anticon.anticon-play-circle{
          font-size: 3em;
          color: $blue;
        }
      }
      .right-control-area{
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        .list-area{
          margin-left: 10px;
          /deep/ .anticon {
            line-height: unset!important;
          }
        }
      }
    }
  }
</style>
