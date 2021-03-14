<template>
      <div class="music-detail-content-box">
        <div class="music-detail-bg" :style="{backgroundImage: songInfo.al.picUrl !== ''? 'url(' + songInfo.al.picUrl + ')' : 'unset'}"></div>
        <div class="music-detail-content">
          <a-icon type="down" class="close-music-detail" @click="closeMusicDetail()"/>
          <div class="music-detail-wrapper">
            <div class="music-detail-left-image">
              <img :style="{animationPlayState: isPaused ? 'paused' : 'running'}" v-if="songInfo.al.picUrl" :src="songInfo.al.picUrl" alt=""/>
            </div>
            <div class="music-detail-right-area">
              <div class="music-title">
                <p>{{songInfo.name}}</p>
                <div class="music-info">
                  <span :title="getTitle" v-for="(auth, index) in songInfo.ar" @click="jumpToAuthorPage(auth)">
                        <span>{{auth.name}}</span><span v-if="index !== songInfo.ar.length - 1">&nbsp;/&nbsp;</span>
                  </span>
                </div>
                <div class="music-info">
                  <span :title="songInfo.al && songInfo.al.name">{{songInfo.al && songInfo.al.name}}</span>
                </div>
                <div class="lyrics-area">
                  <ul class="lyrics" ref="lyrics">
                    <li class="lyrics-row" ref="lyricsRow" v-for="(row, index) in lyric">
                      <span class="lyrics-text">{{row}}</span>
                      <div v-if="lyricsProcess === index">
                        <span class="current-lyrics"
                              :style="{width:  currentTimePercent * currentDom.text * 1.05 + 'px', marginLeft: currentDom.left + 'px' , marginRight: currentDom.left + 'px'}">
<!--                              :style="{width:  currentTimePercent * 100 + '%', marginLeft: currentDom.left + 'px'}">-->
                          {{lyric[lyricsProcess]}}
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
</template>

<script>
    import {bully} from "./service/bully";
    import {SYSTEM_EVENTS} from "../Const";
    import {Settings} from "./service/user-info.service";

    export default {
      name: "music-detail",
      data() {
        return {
          subscriptions$: [],
          lyricsProcess: 0,
          currentTime: 0,
          currentTimePercent: 0,
          currentDom: {
            left: 0,
            text: 0,
            max: 1
          },
          initScrollTop: 0,
        }
      },
      methods: {
        closeMusicDetail() {
          this.$emit('closeMusicDetail', null);
        },
        jumpToAuthorPage() {
          this.$emit('jumpToAuthorPage', null);
        },
        changeLyricsProcess(time) {
          this.currentTime = time + this.startTime;
          console.log(time);
          if (this.$refs.lyricsRow[0] && this.time.findIndex(item => this.currentTime > item[0] && this.currentTime < item[1]) !== this.lyricsProcess) {
            this.currentTimePercent = 0;
            const idx = this.time.findIndex(item => this.currentTime > item[0] && this.currentTime < item[1]);
            this.lyricsProcess = idx <= 0 ? 0 : idx;
            const dom = document.getElementsByClassName('lyrics-row')[this.lyricsProcess];
            this.currentDom = {
              left: (dom.clientWidth - dom.getElementsByClassName('lyrics-text')[0].clientWidth) / 2,
              text: dom.getElementsByClassName('lyrics-text')[0].clientWidth,
              max: dom.clientWidth
            };
            this.$refs.lyrics.scrollTop = this.lyricsProcess * this.$refs.lyricsRow[0].offsetHeight + this.initScrollTop;
          } else {
            this.currentTimePercent =
              (time  + this.startTime - this.time[this.lyricsProcess][0]) / (this.time[this.lyricsProcess][1] - this.time[this.lyricsProcess][0]);
          }
        },
        init() {
          this.currentTime = 0 + this.startTime;
          this.currentTimePercent = 0;
          const idx = this.time.findIndex(item => this.currentTime > item[0] && this.currentTime < item[1]);
          this.lyricsProcess = idx <= 0 ? 0 : idx;
          this.$refs.lyrics.scrollTop = this.initScrollTop;
        }
      },
      mounted() {
        const sub = bully.getMessage().subscribe(res => {
          if (res.type === SYSTEM_EVENTS.CHANGE_PROCESS) {
            this.changeLyricsProcess(res.data);
          }
        });
        this.subscriptions$.push(sub);
      },
      destroyed() {
        for (const ite of this.subscriptions$) {
          if (ite) {
            ite.unsubscribe();
          }
        }
        this.subscriptions$ = null;
      },
      computed: {
        getTitle() {
          return this.songInfo.ar.map(item => item.name).join(' / ');
        }
      },
      props: ['songInfo', 'isPaused', 'lyric', 'time', 'musicDetailShow', 'startTime'],
      watch: {
        musicDetailShow: {
          handler(val) {
            console.log(this.time, 'time;;;;;;;;;');
            if (val) {
              const sub = bully.getMessage().subscribe(res => {
                if (res.type === SYSTEM_EVENTS.CHANGE_PROCESS) {
                  this.changeLyricsProcess(res.data);
                }
              });
              this.subscriptions$.push(sub);
            } else {
              for (const ite of this.subscriptions$) {
                if (ite) {
                  ite.unsubscribe();
                }
              }
              this.subscriptions$ = [];
            }
          }
        },
        songInfo: {
          handler(val) {
            this.init();
          }
        }
      }
    }
</script>

<style scoped lang="scss">
  .music-detail-content-box{
    width: $max;
    height: $max;
    background-color: black;
    .music-detail-content{
      @include flex(row, center, unset);
      position: relative;
      width: $max;
      height: $max;
      z-index: 1001;
      .close-music-detail{
        position: absolute;
        font-size: 1.2em;
        left: 25px;
        top: 25px;
        transform: scaleX(1.3);
      }
      .music-detail-wrapper{
        height: calc(100% - 62px);
        overflow: hidden;
        width: 75%;
        min-width: $minWidth;
        @include flex(row, space-between);
        .music-detail-left-image{
          padding: 0 5% 0 10%;
          img{
            width: $songImageWidth;
            height: $songImageWidth;
            border-radius: 100%;
            -webkit-animation:play 3s linear infinite;
            -moz-animation:play 3s linear infinite;
            animation:play 3s linear infinite;
            animation-play-state: paused;
            @keyframes play{
              0%  {
                -webkit-transform:rotate(0deg);
              }
              100% {
                -webkit-transform:rotate(360deg);
              }
            }
          }
        }
        .music-detail-right-area{
          @include flex(column, space-between);
          width: calc(100% - #{$songImageWidth} - 10% - 5%);
          height: 100%;
          padding: 8% 0 8% 0;
          color: white;
          .music-title{
            @include flex(column, space-between, center);
            width: $max;
            height: $max;
            p{
              line-height: 2em;
              cursor: pointer;
              font-size: 2em;
              font-weight: 500;
              margin-bottom: 0;
              white-space: nowrap;
            }
            >.music-info{
              color: #ABACA9;
              cursor: pointer;
              font-size: 1.1em;
              height: 20px;
              line-height: 20px;
            }
            .lyrics-area{
              cursor: pointer;
              height: 83%;
              width: 100%;
              overflow: hidden;
              position: relative;
              .lyrics{
                height: $max!important;
                overflow: hidden;
                background-color: rgba(0,0,0,0);
                color: rgba(233,233,233,0.65);
                cursor: pointer;
                border: none;
                text-align: center;
                font-size: 1.2em;
                font-weight: 300;
                user-select: none;
                position: relative;
                .lyrics-row:first-child{
                  margin-top: 30%;
                }
                .lyrics-row{
                  @include flex(row, center, center);
                  position: relative;
                  height: 2em;
                  line-height: 2em;
                  width: 100%;
                  >span{
                    width: auto;
                  }
                  >div{
                    height: 100%;
                    position: absolute;
                    width: 100%;
                  }
                }
                .current-lyrics{
                  position: absolute;
                  text-align: left;
                  color: aliceblue;
                  left: 0;
                  white-space: nowrap;
                  height: 2em;
                  line-height: 2em;
                  overflow: hidden;
                }
              }
            }
          }
        }
      }
    }
    .music-detail-bg{
      position: absolute;
      background-color: #fff;
      filter: blur(8px);
      width: $max;
      height: $max;
      z-index: 1000;
      opacity: 0.35;
      background-repeat: no-repeat;
      background-size: $max,$max;
      background-attachment: fixed;
    }
  }
</style>
