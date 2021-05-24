<template>
  <div style="height: 100%">
    <div class="header-content">
      <header-content></header-content>
    </div>
    <div class="main-content">
      <keep-alive>
        <router-view/>
      </keep-alive>
    </div>
    <div class="footer-player">
      <footer-player></footer-player>
    </div>
  </div>
</template>

<script>
  import headerContent from "./header-content";
  import footerPlayer from './footer-player';

  export default {
    name: "right-content",
    components: {
      headerContent,
      footerPlayer
    }
  }
</script>

<style scoped>
  .header-content{
    height: 60px;
    width: 100%;
  }
  .main-content{
    height: calc(100% - 122px);
    width: 100%;
  }
  .footer-player{
    height: 62px;
    width: 100%;
  }
</style>
