<template>
    <div class="music-detail-content" :style="{backgroundImage: songInfo.al.picUrl !== ''? 'url(' + songInfo.al.picUrl + ')' : 'unset'}">

    </div>
</template>

<script>
    export default {
      name: "music-detail",
      data() {
        return {

        }
      },
      props: ['songInfo'],
    }
</script>

<style scoped lang="scss">
  .music-detail-content{
    background-color: #fff;
    filter: blur(8px);
    position: fixed;
    width: $max;
    background-repeat: no-repeat;
    background-size: $max,$max;
    left: 0;
    top: 0;
    height: $max;
    z-index: 1000;
    display: flex;
    background-attachment: fixed;
    flex-direction: column;
  }
</style>
