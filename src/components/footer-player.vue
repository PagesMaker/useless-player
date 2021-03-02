<template>
  <div class="footer-player-content-box" ref="footerPlayerContentBox">
    <div class="process-bar">
      <process-bar :direction="'row'" :toolbar-length="processBarWidth" :process="process" @processChange="changeProcess($event)"></process-bar>
    </div>
    <div class="song-area">
      <div class="song-info">
        <div v-if="songInfo.al.picUrl !== ''" class="song-image">
          <img :src="songInfo.al.picUrl" alt="">
        </div>
        <div class="song-image blue-bg" style="opacity: 0.7" v-else>
          <a-icon type="customer-service"/>
        </div>
        <div class="song-name-area">
          <div class="song-name-content">
            <span class="song-name">{{songInfo.name}}</span>
            <span v-if="songInfo.ar.length">&nbsp;-&nbsp;</span>
            <span v-for="(auth, index) in songInfo.ar" @click="jumpToAuthorPage(auth)">
            <span>{{auth.name}}</span><span v-if="index !== songInfo.ar.length - 1">&nbsp;/&nbsp;</span>
          </span>
          </div>
          <div class="function-area">
            <!--            <a-icon type="heart" title="我喜欢" :theme="songInfo.isLikeHover ? 'filled': 'outlined'" :style="{'color' : songInfo.isLike ? 'red' : 'rgba(0, 0, 0, 0.65)'}" />-->
            <a-icon type="download" title="下载"/>
            <a-icon type="delete" title="从播放列表删除"/>
            <a-icon type="message" title="评论"/>
            <a-icon type="share-alt" title="分享" v-if="false"/><!-- todo -->
            <a-icon type="plus-square" title="添加到"/>
            <div class="add-to-song-list" v-if="addToSongListShow"></div>
          </div>
        </div>
      </div>
      <div class="center-control-area">
        <a-icon v-if="musicControl.playMode === 'list loop'" @click="switchPlayMode('list')" type="sync" title="列表循环"/>
        <a-icon v-if="musicControl.playMode === 'list'" @click="switchPlayMode('single')" type="ordered-list"
                title="列表播放"/>
        <div v-if="musicControl.playMode === 'single'" @click="switchPlayMode('list loop')" class="single-song-loop">
          <a-icon type="sync" title="单曲循环"/>
          <span>1</span></div>
        <a-icon type="step-backward" @click="switchMusic('last')" title="上一首"/>
        <a-icon v-show="isPaused" @click="switchPlayStatus()" type="play-circle" title="播放" theme="filled"/>
        <a-icon v-show="!isPaused" @click="switchPlayStatus()" type="pause-circle" title="暂停" theme="filled"/>
        <a-icon type="step-forward" @click="switchMusic('next')" title="下一首"/>
        <a-dropdown :placement="placement" v-model="soundPanelVisible" :trigger="['click']"
                    overlayClassName="adjust-sound-overlay-content">
          <a-icon type="sound" title="音量"/>
          <div slot="overlay" class="adjust-sound-overlay">
            <div class="sound-tool-bar-area">
              <process-bar :process="sound" :direction="'column'" :toolbar-length="toolbarHeight" @processChange="sound = $event"></process-bar>
            </div>
            <div class="sound">{{ sound + '%'}}</div>
            <div class="muted-area">
              <a-icon type="sound" title="静音" @click="sound = 0"/>
            </div>
          </div>
        </a-dropdown>
        <div class="mask" v-if="soundPanelVisible" @click="soundPanelVisible = false"></div>
      </div>
      <div class="right-control-area">
        <div class="lyrics">
          <i class="anticon">词</i>
        </div>
        <div class="time-area">
          <span>{{ currentTime  | timeFormat('mm:ss')}}</span> <span>&nbsp;/&nbsp;</span> <span>{{getSongTime | timeFormat('mm:ss')}}</span>
        </div>
        <div class="list-area">
          <a-icon type="menu" title=""/>
        </div>
      </div>
    </div>
    <audio :src="songInfo.url" ref="mainPlayer" preload="auto" @pause="isPaused = true" @play="isPaused = false"
           @ended="autoSwitchMusic()" @timeupdate="updateCurrentTime()" id="mainPlayer"></audio>
  </div>
</template>

<script>

  import {bully} from "./service/bully";
  import {SYSTEM_EVENTS} from "../Const";
  import {fromEvent, Subject} from 'rxjs';
  import {takeUntil, throttleTime} from 'rxjs/operators';
  import processBar from './process-bar';
  export default {
    name: 'footer-player',
    components: {
      processBar
    },
    data() {
      return {
        addToSongListShow: false,
        currentTime: 0,
        sound: 50,
        toolbarHeight: 140,
        processBarWidth: 0,
        isPaused: false,
        updateTime$: new Subject(),
        musicControl: {
          playMode: 'list', // 可能的类型，列表播放list，单曲循环single，列表循环list loop
          openSoundAdjustPanel: false
        },
        soundPanelVisible: false,
        init: true,
        subscription: [],
        placement: 'topCenter',
        player: {},
        songInfo: {
          url: '',
          al: {
            picUrl: ''
          },
          name: 'music',
          ar: [{}],
          dt: 0
        },
        songList: []
      }
    },
    methods: {
      jumpToAuthorPage(author) {
        console.log(author);
      },
      openPlayerWindow() {

      },
      switchMusic(e) {
        bully.setMessage({
          type: SYSTEM_EVENTS.SWITCH_SONG,
          data: e
        })
      },
      autoSwitchMusic() {
        switch (this.musicControl.playMode) {
          case "list": {
            bully.setMessage({
              type: SYSTEM_EVENTS.SWITCH_SONG,
              data: 'next'
            })
            break;
          }
          case "single": {
            bully.setMessage({
              type: SYSTEM_EVENTS.SWITCH_SONG,
              data: 'current'
            })
            break;
          }
          case "list loop": {
            bully.setMessage({
              type: SYSTEM_EVENTS.SWITCH_SONG,
              data: 'list loop'
            })
            break;
          }
        }
      },
      getMusic(musicId) {
        return `https://music.163.com/song/media/outer/url?id=${musicId}.mp3`
      },
      changeProcess(e) {
        console.log(e, this.getSongTime);
        this.player.currentTime = this.getSongTime * (e / 100);
        if (this.player.isPaused) {
          this.play();
        }
      },
      play() {
        this.player.volume =  this.sound / 100
        console.log(this.songInfo.url);
        try {
          this.player.play();
        } catch (e) {
          this.songInfo.url = this.getMusic(this.songInfo.id);
          setTimeout(() => {
            this.player.play();
          })
        }
      },
      pause() {
        this.player.pause();
      },
      switchPlayMode(e) {
        this.musicControl.playMode = e;
      },
      updateCurrentTime() {
        this.updateTime$.next();
      },
      switchPlayStatus() {
        this.player.paused ? this.play() : this.pause();
      }
    },
    computed: {
      getSongTime() {
        return !this.songInfo.dt ? 0 : this.songInfo.dt / 1000
      },
      process() {
        const process = (this.currentTime / this.getSongTime) * 100;
        return isNaN(process) ? 0 : process
      }
    },
    mounted() {
      this.processBarWidth = this.$refs.footerPlayerContentBox.clientWidth - 10;
      fromEvent(window, 'resize').pipe(throttleTime(100)).subscribe(() => {
        this.processBarWidth = this.$refs.footerPlayerContentBox.clientWidth - 10;
      });
      this.isPaused = true;
      this.player = this.$refs.mainPlayer;
      const sub0 = this.updateTime$.asObservable().pipe(throttleTime(800)).subscribe(() => {
        if (!this.isPaused) {
          this.currentTime = +this.player.currentTime.toFixed(0);
        }
      })
      const sub = bully.getMessage().subscribe(res => {
        if (res.type === SYSTEM_EVENTS.PLAY_MUSIC) {
          try {
            if (!this.player.paused) {
              this.pause();
              this.songInfo.url = '';
            }
            this.$nextTick(() => {
              this.songInfo = JSON.parse(JSON.stringify(res.data));
              this.$nextTick(() => {
                if (this.player.paused) {
                  // 暂停
                  if (this.songInfo.fee === 1) {
                    this.$message.warning('该歌曲为收费曲目，只能试听15秒');
                  }
                  if (!this.init) {
                    this.play();
                  } else {
                    this.init = false;
                  }
                }
              });
            });
          } catch (e) {
            console.log(e);
          }
        }
      });
      this.subscription.push(sub, sub0);
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
      sound: {
        handler(val) {
          this.player.volume = val / 100;
        }
      }
    }
  }
</script>

<style lang="scss" scoped>

  .footer-player-content-box {
    width: $max;

    /deep/ .anticon {
      font-size: 1.2em;
    }

    .process-bar {
      width: $max;
      height: 3px;
      background-color: $gray;
    }

    .song-area {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      padding: 5px 20px;
      width: $max;

      > div {
        width: $p33;
        height: $max;
        display: flex;
      }

      .song-info {
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;

        .song-name-area {
          margin: 0 10px;

          /deep/ .anticon:not(:first-child) {
            padding: 0 3px;
          }

          .song-name-content {
            .song-name {
              color: black;
              font-size: 1.2em;
              font-weight: 500;
            }
          }
        }

        .song-image {
          width: 40px;
          color: #E3E3E3;
          height: 40px;
          border-radius: 5px;
          font-size: 2em;
          display: flex;
          justify-content: center;
          align-items: center;

          img {
            width: $max;
            height: $max;
          }
        }
      }

      .center-control-area {
        flex-direction: row;
        align-items: center;
        justify-content: center;

        /deep/ .anticon.anticon-step-backward, .anticon.anticon-step-forward {
          font-size: 2em;
          margin: 0 10px;
        }

        /deep/ .anticon.anticon-play-circle, .anticon.anticon-pause-circle {
          font-size: 3em;
          color: $blue;
        }

        .single-song-loop {
          position: relative;
          span {
            position: absolute;
            left: 5px;
            top: -1px;
            user-select: none;
            cursor: pointer;
          }
        }
        .single-song-loop:hover{
          color: $blue;
        }
      }

      .right-control-area {
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        display: flex;
        .lyrics{
          margin-right: 10px;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          display: flex;
        }
        .list-area {
          margin-left: 10px;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          display: flex;
        }
      }
    }
  }
</style>
<style lang="scss">
  .mask {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  .adjust-sound-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    border-radius: 10px;
    width: 75px;
    height: 240px;
    padding: 25px 0 15px 0;
    background-color: #E3E3E3;

    .sound-tool-bar-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      width: 5%;
      height: 70%;
    }
  }
  .muted-area{
    margin-top: 12%;
  }
</style>
