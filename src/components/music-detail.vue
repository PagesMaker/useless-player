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
                <div>
                  <span :title="getTitle" v-for="(auth, index) in songInfo.ar" @click="jumpToAuthorPage(auth)">
                        <span>{{auth.name}}</span><span v-if="index !== songInfo.ar.length - 1">&nbsp;/&nbsp;</span>
                  </span>
                </div>
                <div>
                  <span :title="songInfo.al && songInfo.al.name">{{songInfo.al && songInfo.al.name}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
</template>

<script>
    export default {
      name: "music-detail",
      data() {
        return {

        }
      },
      methods: {
        closeMusicDetail() {
          this.$emit('closeMusicDetail', null);
        },
        jumpToAuthorPage() {
          this.$emit('jumpToAuthorPage', null);
        }
      },
      computed: {
        getTitle() {
          return this.songInfo.ar.map(item => item.name).join(' / ');
        }
      },
      props: ['songInfo', 'isPaused'],
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
