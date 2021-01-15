<template>
  <div class="footer-player-content-box">
    <div class="process-bar"></div>
    <div class="song-area">
      <div class="song-info">
        <img :src="songInfo.songImg" alt="">
        <div class="song-area">
          <div class="song-name">
            <span>{{songInfo.songName}}</span>
            <span>&nbsp;-&nbsp;</span>
            <span v-for="(auth, index) in songInfo.songAuthor" @click="jumpToAuthorPage(auth)">
            <span>{{auth}}</span><span v-if="index !== songInfo.songAuthor.length - 1">&nbsp;/&nbsp;</span>
          </span>
          </div>
          <div class="function-area">
            <a-icon type="heart" title="我喜欢" :theme="songInfo.isLikeHover ? 'filled': 'outlined'" :style.color="songInfo.isLike ? 'red' : 'black'" />
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
        <a-icon type="sound"  title="sound"/>
        <div class="adjust-sound" v-if="musicControl.openSoundAdjustPanel"></div>
      </div>
      <div class="right-control-area">
        <div class="time-area">
          <span>{{currentTime | timeFormat('mm:ss')}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'footer-player',
    data() {
      return {
        addToSongListShow: false,
        currentTime: 999,
        musicControl: {
          playMode: 'list', // 可能的类型，列表播放list，单曲循环single，列表循环list loop
          isPlaying: false,
          openSoundAdjustPanel: false
        },
        songInfo: {
          songImg: '',
          songName: 'music',
          songAuthor: ['11', '222', '33'],
          isLike: false,
          isLikeHover: false,
          totalTime: ''
        }
      }
    },
    methods:{
      jumpToAuthorPage(author) {
        console.log(author);
      },
      openPlayerWindow() {

      }
    },
    computed:{}
  }
</script>

<style scoped>

</style>
