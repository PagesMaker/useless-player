<template>
  <div class="header-content-box">
    <a-input class="search-music-input" ref="userNameInput" v-model="searchMusic" placeholder="Basic usage">
      <a-icon slot="prefix" type="search" />
    </a-input>
    <div class="user-infos">

    </div>
  </div>
</template>

<script>

  export default {
    name: 'header-content',
    data() {
      return {
        searchMusic: ''
      }
    }
  }
</script>

<style lang="scss" scoped>
  .header-content-box{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    .search-music-input{
      width: 24%;
      height: 60%;
      margin-left: 20px;
      /deep/ .ant-input{
        border-radius: 30px;
        box-shadow: 2px 2px rgba(1,1,1,0.3);
      }
    }
    .user-infos{
      width: 20%;
      height: auto;
    }
  }
</style>
