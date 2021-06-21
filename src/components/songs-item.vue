<template>
  <div class="box-conetent" @click="playlistsHandle(type)">
    <div class="list-bg-wrapper"  @mouseenter="selectedIndexHandle(index)"  @mouseleave="selectedIndexHandle(-1)">
      <div class="list-bg" :style="{backgroundImage: item.picUrl ? 'url(' + item.picUrl + '?param=250y250'  + ')'  : 'unset'}">
        <div class="listen-times" v-if="showPlayCount">
          <a-icon type="customer-service" />
          <span>{{item.playCount | tenThousands(1)}}</span>
        </div>
        <div class="box-wrapper-mask" v-show="selectedIndex === index">
          <a-icon type="play-circle" title="播放" theme="filled"/>
        </div>
      </div>
    </div>
    <div class="list-link">
      <span>{{item.name}}</span>
      <span v-if="showSingerName">{{item.artist.name}}</span>
    </div>
  </div>
</template>

<script>
    export default {
      name: "songs-item",
      data() {
        return {
        }
      },
      props: ['item', 'index', 'selectedIndex', 'type', 'showPlayCount', 'showSingerName'],
      mounted() {
      },
      methods: {
        playlistsHandle(type) {
          this.$emit('playlistsHandle', type)
        },
        selectedIndexHandle(index) {
          this.$emit('selectedIndexHandle', index)
        }
      }
    }
</script>

<style lang="scss" scoped>
  .box-conetent{
    width: 100%;
    height: 100%;
  }
  .list-bg-wrapper{
    width: 1.2rem;
    height: 1.2rem;
  }
  .list-bg{
    background-repeat: round;
    background-attachment: local;
    position: relative;
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 20px;
    .box-wrapper-mask{
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0;
      border-radius: 20px;
      @include flex(column, center, center);
      width: $max;
      height: $max;
      background-color: rgba(0,0,0,0.75);
      /deep/ .anticon{
        color: white;
        font-size: 4em;
        -webkit-animation: showMask 0.25s linear normal;
        -moz-animation: showMask 0.25s linear normal;
        animation: showMask 0.25s linear normal;
        animation-fill-mode: forwards;
      }
      /deep/ .anticon:hover{
        color: $deepBlue;
      }
    }
  }
  .list-bg-wrapper:hover {
    cursor: pointer;
    -webkit-animation: moveIn 0.25s linear normal;
    -moz-animation: moveIn 0.25s linear normal;
    animation: moveIn 0.25s linear normal;
    animation-fill-mode: forwards;
  }
  .box-wrapper-mask:hover{
    -webkit-animation: showMask 0.25s linear normal;
    -moz-animation: showMask 0.25s linear normal;
    animation: showMask 0.25s linear normal;
    animation-fill-mode: forwards;
  }
  .list-link{
    margin-top: 10px;
    @include flex(column, space-between, flex-start);
  }
  .list-link span:hover{
    color: $blue;
    cursor: pointer;
  }
  .listen-times{
    position: absolute;
    bottom: 5%;
    right: 5%;
    padding: 1px 10px;
    background-color: rgba(0,0,0,0.75);
    border-radius: 20px;
    color: white;
    /deep/ .anticon{
      color: white;
    }
  }
  @keyframes showMask{
    0%  {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  @keyframes moveIn{
    0%  {
      margin-top: 0;
    }
    100% {
      margin-top: -20px;
      padding-bottom: 20px;
      height: calc(1.2rem + 20px);
    }
  }
  @keyframes moveInRankList{
    0%  {
      margin-top: 20px;
    }
    100% {
      margin-top: 5px;
    }
  }
</style>
