<template>
  <div class="box-content" :class="type === 'singer' ? 'is-singer' : ''">
    <div class="list-bg-wrapper" :style="{transform : `scale(${size})`}" @mouseenter="selectedIndexHandle(index)"  @mouseleave="selectedIndexHandle(-1)">
      <div class="list-bg" @click="playlistsHandle(type)" :style="{
        backgroundImage: (item.picUrl || item.coverImgUrl) ? 'url(' + (item.picUrl || item.coverImgUrl) + '?param=250y250'  + ')'  : 'unset',
        borderRadius: type === 'singer' ? '50%' : '20px'
      }">
        <div class="listen-times" v-if="showPlayCount">
          <a-icon type="customer-service" />
          <span>{{item.playCount | tenThousands(1)}}</span>
        </div>
        <div class="box-wrapper-mask"  :style="{
        borderRadius: type === 'singer' ? '50%' : '20px'
      }" v-show="selectedIndex === index">
          <a-icon type="play-circle" title="播放" theme="filled"/>
        </div>
      </div>
    </div>
    <div class="list-link-content">
      <div class="list-link" v-if="showListName">
        <div v-if="type=== 'singer' && index <= 2" class="rank-index">{{index + 1}}</div>
        <span :title="item.name">{{item.name}}</span>
      </div>
      <div class="list-link" v-if="showSingerName">
        <span :title="item.artist.name" >{{item.artist.name}}</span>
      </div>
      <div class="list-link" v-if="showCreatorName">
        <span :title="item.creator.nickname" >by : {{item.creator.nickname}}</span>
      </div>
      <a-icon type="delete" v-if="showDeleteIcon" @click.stop="removeListFromFavorite(item, index)"></a-icon>
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
      props: {
        item: {
          default: {}
        }, index: {
          default: 0
        }, selectedIndex: {
          default: 0
        }, type: {
          default: 'playlists'
        }, showPlayCount: {
          default: true
        }, showSingerName: {
          default: true
        }, showListName: {
          default: true
        }, showDeleteIcon: {
          default: true
        }, size: {
          default: 1
        }, showCreatorName: {
          default: false
        }
      },
      mounted() {
      },
      methods: {
        playlistsHandle(type) {
          this.$emit('playlistsHandle', type)
        },
        selectedIndexHandle(index) {
          this.$emit('selectedIndexHandle', index)
        },
        removeListFromFavorite(item, index) {
          this.$emit('removeListFromFavorite', index);
        }
      }
    }
</script>

<style lang="scss" scoped>
  .box-content{
    width: 100%;
    height: 100%;
  }
  .box-content.is-singer{
    @include flex(column, flex-start, center);
  }
  .list-bg-wrapper{
    height: 1.2rem;
    width: 1.2rem;
    .list-bg{
      width: 1.2rem;
      height: 1.2rem;
    }
  }
  .list-bg{
    background-repeat: round;
    background-attachment: local;
    position: relative;
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
  .list-link-content{
    margin-top: 10px;
    @include flex(column, flex-start, flex-start);
  }
  .list-link{
    @include flex(column, space-between, flex-start);
  }
  .list-link{
    width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    word-break: break-all; /* 追加这一行代码 */
    .rank-index{
      display: inline-block;
      width: 18px;
      height: 18px;
      line-height: 18px;
      background-color: $blue;
      color: white;
      font-weight: 600;
      text-align: center;
    }
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
