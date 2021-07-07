<template>
  <div style="height: 100%">
    <div class="header-content">
      <header-content></header-content>
    </div>
    <div class="main-content">
      <a-spin :spinning="loading">
        <keep-alive>
          <router-view/>
        </keep-alive>
      </a-spin>
    </div>
    <div class="footer-player">
      <footer-player></footer-player>
    </div>
  </div>
</template>

<script>
  import headerContent from "./header-content";
  import footerPlayer from './footer-player';
  import {SYSTEM_EVENTS} from "../Const";
  import {bully} from "./service/bully";

  export default {
    name: "right-content",
    components: {
      headerContent,
      footerPlayer
    },
    data() {
      return {
        loading: false
      }
    },
    mounted() {
      bully.getMessage().subscribe(res => {
        if (res.type === SYSTEM_EVENTS.PAGE_LOADING) {
          this.loading = res.data || false;
        }
      });
    }
  }
</script>

<style scoped lang="scss">
  .header-content{
    height: 60px;
    width: 100%;
  }
  .main-content{
    height: calc(100% - 122px);
    width: 100%;
    /deep/ &>.ant-spin-nested-loading{
      height: 100%;
      &>.ant-spin-container{
        height: 100%;
      }
    }
  }
  .footer-player{
    height: 62px;
    width: 100%;
  }
</style>
