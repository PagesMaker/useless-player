<template>
  <div class="footer-player-content-box" :class="musicDetailShow ? 'music-detail-footer-player' : ''" ref="footerPlayerContentBox">
    <div class="process-bar">
      <process-bar :direction="'row'" :toolbar-length="processBarWidth" :process="process" @processChange="changeProcess($event)"></process-bar>
    </div>
    <div class="song-area">
      <div class="song-info">
        <div v-if="(songInfo.al || songInfo.album).picUrl !== '' && !musicDetailShow" @mouseenter="pictureHover = true" @mouseleave="pictureHover = false" @click="openMusicDetail()" class="song-image">
          <img :src="(songInfo.al || songInfo.album).picUrl + '?param=50y50'" alt="" :style="{filter: pictureHover ? 'brightness(0.7)' : 'unset'}">
          <a-icon v-if="pictureHover" class="song-image-icon" type="double-left"/>
        </div>
        <div class="song-image blue-bg" style="opacity: 0.7" v-else-if="(songInfo.al || songInfo.album).picUrl === '' && !musicDetailShow">
          <a-icon type="customer-service"/>
        </div>
        <div class="song-name-area">
          <div class="song-name-content" v-if="!musicDetailShow">
            <span class="song-name">{{songInfo.name}}</span>
            <span v-if="(songInfo.ar || songInfo.artists).length">&nbsp;-&nbsp;</span>
            <span v-for="(auth, index) in (songInfo.ar || songInfo.artists)" @click="jumpToAuthorPage(auth)">
               <span>{{auth.name}}</span><span v-if="index !== (songInfo.ar || songInfo.artists).length - 1">&nbsp;/&nbsp;</span>
            </span>
          </div>
          <div class="function-area">
            <!--            <a-icon type="heart" title="我喜欢" :theme="songInfo.isLikeHover ? 'filled': 'outlined'" :style="{'color' : songInfo.isLike ? 'red' : 'rgba(0, 0, 0, 0.65)'}" />-->
            <icon-group
              :showIcon="showIcon"
              @handleDownload="handleDownload()"
              @handleRemove="handleRemove()"
              @handleComment="handleComment()"
              @addToList="addToList($event)"
              @addToNewList="addToNewList()"
            ></icon-group>
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
        <a-icon type="step-backward" @click="switchMusic('prev')" title="上一首"/>
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
        <a-tooltip placement="topLeft">
          <template slot="title">
            <span>暂未实现</span>
          </template>
          <div class="lyrics">
            <i class="anticon">词</i>
          </div>
        </a-tooltip>
        <div class="time-area">
          <span>{{ currentTime + startTime  | timeFormat('mm:ss')}}</span> <span>&nbsp;/&nbsp;</span> <span>{{getSongTime | timeFormat('mm:ss')}}</span>
        </div>
        <a-tooltip placement="topLeft">
          <template slot="title">
            <span>暂未实现</span>
          </template>
          <div class="list-area">
            <a-icon type="menu" title=""/>
          </div>
        </a-tooltip>
      </div>
    </div>
    <audio :src="songInfo.url" ref="mainPlayer" preload="auto" @pause="isPaused = true" @play="isPaused = false"
           @ended="autoSwitchMusic()" @timeupdate="updateCurrentTime()" id="mainPlayer"></audio>
      <a-modal :visible="musicDetailShow"
               :keyboard="true"
               :closable="false"
               :footer="null"
               wrapClassName="music-details"
      >
        <music-detail @closeMusicDetail="closeMusicDetail()" :startTime="startTime" :musicDetailShow="musicDetailShow" :lyric="lyricArr" :time="timeArr" :songInfo="songInfo" :isPaused="isPaused"></music-detail>
      </a-modal>
  </div>
</template>

<script>

  import {bully} from "./service/bully";
  import {APP, SYSTEM_EVENTS} from "../Const";
  import {fromEvent, Subject} from 'rxjs';
  import {debounceTime, throttleTime} from 'rxjs/operators';
  import processBar from './process-bar';
  import musicDetail from './music-detail';
  import iconGroup from './icon-group';
  import {UserInfos} from "./service/user-info.service";
  import {songInfoService} from "./service/song-info.service";
  export default {
    name: 'footer-player',
    components: {
      processBar,
      musicDetail,
      iconGroup
    },
    data() {
      return {
        showIcon: [],
        addToSongListShow: false,
        currentTime: 0,
        sound: 50,
        toolbarHeight: 140,
        processBarWidth: 0,
        changeProcess$: new Subject(),
        isPaused: false,
        updateTime$: new Subject(),
        musicControl: {
          playMode: 'list', // 可能的类型，列表播放list，单曲循环single，列表循环list loop
          openSoundAdjustPanel: false
        },
        soundPanelVisible: false,
        init: true,
        musicDetailShow: false,
        lyric: '',
        lyricArr: [],
        timeArr: [],
        pictureHover: false,
        startTime: 0,
        subscription: [],
        placement: 'topCenter',
        player: {},
        songInfo: {
          url: '',
          al: {
            picUrl: ''
          },
          ablum: {
            picUrl: ''
          },
          name: 'music',
          ar: [],
          artists: [],
          dt: 0,
          duration: 0
        },
        songList: []
      }
    },
    methods: {
      jumpToAuthorPage(author) {
        console.log(author);
      },
      openMusicDetail() {
        this.musicDetailShow = true;
      },
      closeMusicDetail() {
        this.musicDetailShow = false;
        this.pictureHover = false;
      },
      switchMusic(e) {
        bully.setMessage({
          type: SYSTEM_EVENTS.SWITCH_SONG,
          data: {type: e, switchSong: true}
        })
      },
      autoSwitchMusic(switchSong = true) {
        let type = 'next';
        switch (this.musicControl.playMode) {
          case 'list': {
            break;
          }
          case 'single': {
            type = 'current';
            break;
          }
          case 'list loop': {
            type = 'list loop';
            break;
          }
        }
        bully.setMessage({
          type: SYSTEM_EVENTS.SWITCH_SONG,
          data: {type, switchSong}
        })
      },
      handleDownload() {
        songInfoService.getSongUrl(this.songInfo.id).subscribe(async res => {
          if (res.code === 200) {
            for (const item of res.data) {
              let response = await fetch(item.url);
              let blob = await response.blob();
              let objectUrl = window.URL.createObjectURL(blob);
              let a = document.createElement('a');
              a.href = objectUrl;
              a.download = `${this.songInfo.name}.${item.type || 'mp3'}`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
          } else {
            this.$message.error('获取歌曲地址失败');
          }
        }, () => {
          this.$message.error('获取歌曲地址失败');
        });
      },
      handleRemove() {
        bully.setMessage({
          type: SYSTEM_EVENTS.ADD_TO_SONG_LIST,
          data: {
            op: 'del',
            tracks: this.songInfo.id,
            pid: this.songInfo.crtListId
          }
        });
      },
      handleComment() {
        // todo
      },
      addToList(e) {
        bully.setMessage({
          type: SYSTEM_EVENTS.ADD_TO_SONG_LIST,
          data: {
            op: 'add',
            tracks: this.songInfo.id,
            pid: e
          }
        });
      },
      addToNewList() {
        bully.setMessage({
          type: SYSTEM_EVENTS.ADD_TO_NEW_SONG_LIST,
          data: {
            op: 'add',
            tracks: this.songInfo.id,
          }
        });
      },
      getMusic(musicId) {
        console.log('plan b', musicId)
        return `https://music.163.com/song/media/outer/url?id=${musicId.id}.${musicId.type ? musicId.type.toLowerCase() : 'mp3'}`
      },
      changeProcess(e) {
        this.changeProcess$.next(e);
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
          this.songInfo = { ...this.songInfo, url: this.getMusic(this.songInfo)};
          this.$nextTick(() => {
            this.player.play();
          });
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
        // if (this.musicDetailShow) {
          bully.setMessage({
            type: SYSTEM_EVENTS.CHANGE_PROCESS,
            data: this.player.currentTime
          })
        // }
      },
      switchPlayStatus() {
        this.player.paused ? this.play() : this.pause();
      }
    },
    computed: {
      getSongTime() {
        return !(this.songInfo.dt || this.songInfo.duration) ? 0 : (this.songInfo.dt || this.songInfo.duration) / 1000
      },
      process() {
        const process = ((this.currentTime + this.startTime) / this.getSongTime) * 100;
        return isNaN(process) ? 0 : process
      }
    },
    mounted() {
      this.showIcon = ['comment', 'deleteFromList', 'download', 'addToList'];
      this.changeProcess$.asObservable().pipe(debounceTime(500)).subscribe(e => {
        this.player.currentTime = this.getSongTime * (e / 100);
      });
      this.processBarWidth = this.$refs.footerPlayerContentBox.clientWidth - 10;
      fromEvent(window, 'resize').pipe(throttleTime(100)).subscribe(() => {
        this.processBarWidth = this.$refs.footerPlayerContentBox.clientWidth - 10;
        if (window.innerHeight < APP.MIN_HEIGHT || window.innerHeight < APP.MIN_WIDTH) {
          window.resizeTo(APP.MIN_WIDTH, APP.MIN_HEIGHT);
        }
      });
      this.isPaused = true;
      this.player = this.$refs.mainPlayer;
      const sub0 = this.updateTime$.asObservable().pipe(throttleTime(800)).subscribe(() => {
        if (!this.isPaused) {
          console.log(this.player.currentTime);
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
              console.log(this.songInfo);
              songInfoService.getLyricsById(this.songInfo.id).subscribe(res => {
                this.lyric = '';
                if (res.code === 200 && !res.nolyric) {
                  this.lyric = res.lrc.lyric;
                }
              });
              this.$nextTick(() => {
                if (this.player.paused) {
                  // 暂停
                  /*if (this.songInfo.fee === 1 && this.songInfo.freeTrialInfo) {
                    this.$message.warning('该歌曲为收费曲目，只能试听15秒');
                    this.startTime = this.songInfo.freeTrialInfo ? this.songInfo.freeTrialInfo.start : 0;
                  } else {
                    this.startTime = 0
                  }*/
                  if (this.songInfo.fee === 1 && this.songInfo.freeTrialInfo && UserInfos.userInfo.vipType === 0) {
                    this.$message.warning('该歌曲为vip曲目，只能试听15秒。因为版权问题和本站非盈利的原因，不支持充值vip功能，请移步网易云');
                    this.startTime = this.songInfo.freeTrialInfo.start;
                  } else if (this.songInfo.fee === 1 && !this.songInfo.freeTrialInfo && UserInfos.userInfo.vipType === 0) {
                    this.$message.warning('该歌曲为vip曲目。因为版权问题和本站非盈利的原因，不支持充值vip功能，请移步网易云');
                    return;
                  } else if (this.songInfo.fee > 1 && !this.songInfo.payed === 0) {
                    this.$message.warning('该歌曲为收费曲目。因为版权问题和本站非盈利的原因，不支持购买数字专辑功能，请移步网易云');
                    return;
                  } else {
                    this.startTime = 0
                  }
                  this.play();
                }
              });
            });
          } catch (e) {
            console.log(e);
          }
        }
        if (res.type === SYSTEM_EVENTS.SWITCH_AFTER_REMOVE_SONG) {
          console.log(res.data);
          if (res.data.op === 'del') {
            if (res.data.tracks === this.songInfo.id) {
              this.autoSwitchMusic(false);
            }
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
      },
      lyric: {
        handler(val) {
          console.log(val, '111');
          this.lyricArr = [];
          this.timeArr = [];
          if (!val) {
            return;
          }
          const temp = val.split('[');
          temp.shift();
          const timeArr = [],
            lyricsArr = [];
          temp.forEach(item => {
            item = item.split(']');
            timeArr.push((+item[0].split(':')[0] * 60 * 1000) + (+item[0].split(':')[1] * 1000));
            lyricsArr.push(item[1]);
          });
          console.log(timeArr, lyricsArr);
          lyricsArr.unshift('');
          this.lyricArr = lyricsArr;
          this.timeArr = timeArr.map((item, index) => {
            if (index === 0) {
              return [0, timeArr[0] / 1000];
            } else {
              return [timeArr[index - 1] / 1000, item / 1000]
            }
          });
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .music-detail-footer-player{
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: $z1e4;
  }
  .footer-player-content-box {
    width: $max;
    /deep/ .anticon {
      font-size: 1.2em;
    }

    .process-bar {
      width: $max;
      height: 3px;
      background-color: #C6D7E7;
    }

    .song-area {
      @include flex(row, space-between, center);
      height: calc(100% - 3px);
      padding: 5px 20px;
      width: $max;

      > div {
        width: $p33;
        height: $max;
        display: flex;
      }

      .song-info {
        @include flex(row, flex-start, center);
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
          cursor: pointer;
          width: 40px;
          color: #E3E3E3;
          height: 40px;
          border-radius: 5px;
          font-size: 20px;
          font-weight: 200;
          @include flex(row, center, center);
          /deep/ .song-image-icon{
            transform: rotate(90deg);
            color: white;
            position: absolute;
          }
          img {
            width: $max;
            height: $max;
          }
        }
      }

      .center-control-area {
        @include flex(row, center, center);
        /deep/ .anticon{
          color: black!important;
        }
        /deep/ .anticon:hover{
          color: #5DB1FF!important
        }
        /deep/ .anticon.anticon-step-backward, .anticon.anticon-step-forward {
          font-size: 2em;
          margin: 0 10px;
        }

        /deep/ .anticon.anticon-play-circle, .anticon.anticon-pause-circle {
          font-size: 3em;
          color: #5DB1FF!important;
        }

        .single-song-loop {
          position: relative;
          color: black!important;
          /deep/ .anticon{
            color: unset!important;
          }
          span {
            position: absolute;
            left: 5px;
            top: -1px;
            user-select: none;
            cursor: pointer;
          }
        }
        .single-song-loop:hover{
          color: $blue!important;
        }
      }

      .right-control-area {
        @include flex(row, flex-end, center);
        .lyrics{
          margin-right: 10px;
          @include flex(row, center, center);
        }
        .list-area {
          margin-left: 10px;
          @include flex(row, center, center);
        }
      }
    }
  }
  .music-detail-footer-player.footer-player-content-box {
    .time-area{
      color: rgb(160,160,160);
    }
    .center-control-area {
      /deep/ .anticon{
        color: white!important;
      }
      .single-song-loop {
        color: white!important;
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
  .adjust-sound-overlay-content{
    z-index: $z1e7;
  }
  .adjust-sound-overlay {
    @include flex(column, space-between, center);
    border-radius: 10px;
    width: 75px;
    height: 240px;
    padding: 25px 0 15px 0;
    background-color: #E3E3E3;

    .sound-tool-bar-area {
      width: 3px;
      height: 70%;
      background-color: #C6D7E7;
    }
  }
  .muted-area{
    margin-top: 12%;
  }
  .ant-modal-wrap.music-details{
    overflow: hidden;
    z-index: 1001;
    width: $max!important;
    height: $max!important;
    .ant-modal {
      width: $max!important;
      height: $max!important;
      padding: 0!important;
      top: 0!important;
      .ant-modal-content{
        width: $max!important;
        height: $max!important;
        .ant-modal-body{
          width: $max!important;
          height: $max!important;
          padding: 0!important;
        }
      }
    }
  }
</style>
