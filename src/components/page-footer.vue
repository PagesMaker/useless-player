<template>
    <div class="footer-content">
      <div class="footer">
        <p>Copyright © 2021</p>
        <p>Powered by vue2.0 & antd & <a target="_blank" href="https://github.com/Binaryify/NeteaseCloudMusicApi">NeteaseCloudMusicApi</a></p>
        <a target="_blank" href="https://beian.miit.gov.cn/#/Integrated/index"> </a>
      </div>
    </div>
</template>

<script>
    export default {
        name: "page-footer"
    }
</script>

<style scoped lang="scss">
  .footer-content{
    @include flex(row, center ,center);
  }
  .footer{
    height: 0.2rem;
    width: 50%;
    min-width: 50%;
    white-space: nowrap;
    font-size: 1em;
    color: #808080;
    @include flex(row, space-around ,center);
    p,a {
      margin: 0;
      color: #808080;
    }
    a{
      font-weight: 500;
    }
    a:hover{
      color: $blue;
    }
  }
</style>
