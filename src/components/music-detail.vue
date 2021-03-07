<template>
      <div class="music-detail-content-box">
        <div class="music-detail-bg" :style="{backgroundImage: songInfo.al.picUrl !== ''? 'url(' + songInfo.al.picUrl + ')' : 'unset'}"></div>
        <div class="music-detail-content">
          <a-icon type="down" class="close-music-detail" @click="closeMusicDetail()"/>
          <div class="music-detail-wrapper">
            <div class="music-detail-left-image">
              <img v-if="songInfo.al.picUrl" :src="songInfo.al.picUrl" alt=""/>
            </div>
            <div class="music-detail-right-area">

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
      display: flex;
      flex-direction: row;
      justify-content: center;
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
        display: flex;
        flex-direction: column;
        justify-content: center;
        .music-detail-left-image{
          padding: 0 10% 0 10%;
          img{
            width: 430px;
            height: 430px;
          }
        }
        .music-detail-right-area{

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
