<template>
  <div>
    <div class="header-content-box">
      <a-input class="search-music-input" ref="userNameInput" v-model="searchMusic" placeholder="Basic usage">
        <a-icon slot="prefix" type="search" />
      </a-input>
      <div class="user-infos">
        <div v-if="userInfos.isLogin"  class="user-header">
          <img :src="userInfos.headerImg" alt="">
        </div>
        <div v-else class="user-header" @click="!userInfos.isLogin ? visible = true : gotoUserPage">
          <a-icon type="user" />
        </div>
        <div class="user-name">
          <span>{{userInfos.isLogin ? userInfos.userName : '请登录'}}</span>
        </div>
      </div>
    </div>
    <a-modal class="login-modal" v-if="visible" v-model="visible" title="登录" @ok="handleOk" :footer="null">
      <div v-if="loginProcess === 'loginHome'" class="login-content">
        <div class="login-image"></div>
          <a-button  type="primary" class="login-by-phone" @click="loginProcess = 'loginByPhone'">手机号登录</a-button>
          <a-button class="register" @click="loginProcess = 'loginByPhone'">注册</a-button>
      </div>
      <div v-else-if="loginProcess === 'register'" class="login-content">

      </div>
      <div v-else-if="loginProcess === 'loginByPhone'" class="login-content">

      </div>
      <div v-if="loginProcess !== 'loginHome'">
<!--        <a-button key="back" @click="">-->
<!--          <a href="">其他登录方式</a>-->
<!--        </a-button>-->
<!--        <a-button key="submit" type="primary" :loading="loading" @click="handleOk">-->
<!--          登录-->
<!--        </a-button>-->
        <div>
          <span @click="loginProcess = 'loginHome'"><a-icon style="color: #096dd9" type="left" /><a>其他登录方式</a></span>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
  import {UserInfos} from './service/user-info.service';
  export default {
    name: 'header-content',
    data() {
      return {
        searchMusic: '',
        userInfos: UserInfos.userInfo,
        visible: false,
        loginProcess: 'loginHome', // 可能的值有 'loginHome', 'loginByPhone', 'register'
        loading: false
      }
    },
    methods: {
      handleOk(e) {
        console.log(e);
      },
      gotoUserPage() {

      },
      handleCancel() {
        this.visible = false;
        this.isLoginByPhone = false;
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
    /deep/ .anticon.anticon-user{
      font-size:2em;
    }
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
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      .user-name{
        margin-left: 10px;
      }
      .user-header{
        border-radius: 40px;
      }
    }
  }
  .login-modal{
    .login-content{
      height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      .login-image{
        width: 203px;
        height: 107px;
        background-image: url("../assets/images/platform.png");
      }
      /deep/ .ant-btn{
        width: 210px;
        height: 30px;
      }
    }
  }
</style>
