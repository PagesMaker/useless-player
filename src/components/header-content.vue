<template>
  <div>
    <div class="header-content-box">
      <a-input class="search-music-input" ref="userNameInput" v-model="searchMusic" placeholder="搜索音乐">
        <a-icon slot="prefix" type="search" />
      </a-input>
      <div class="user-infos">
        <div v-if="userInfos.isLogin"  class="user-header">
          <img :src="userInfos.headerImg" alt="">
        </div>
        <div v-else class="user-header" @click="!userInfos.isLogin ? openLoginWindow() : gotoUserPage()">
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
        <a-tooltip placement="topLeft">
          <template slot="title">
            <span>出于安全考虑，暂时只支持扫码登录，请使用网易云音乐app进行扫码</span>
          </template>
          <a-button  type="primary" class="login-by-phone" @click="loginProcess = 'loginByQR'">扫码登录</a-button>
        </a-tooltip>
          <a-button class="register" @click="loginProcess = 'loginByQR'">注册</a-button>
      </div>
      <div v-else-if="loginProcess === 'register'" class="login-content">

      </div>
      <div v-else-if="loginProcess === 'loginByQR'" class="login-content">
        <img v-if="qr" :src="qr" alt="">
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
  const config = require('../../config');
  export default {
    name: 'header-content',
    data() {
      return {
        qr: '',
        qrKey: '',
        searchMusic: '',
        userInfos: UserInfos.userInfo,
        visible: false,
        loginProcess: 'loginHome', // 可能的值有 'loginHome', 'loginByQR', 'register'
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
      },
      openLoginWindow() {
        this.visible = true;
        this.getQR();
        this.intervalOfGetQR = setInterval(() => {
          this.axios.get( config.dev.server + `/login/qr/check?key=${this.qrKey}?timerstamp=${new Date().getTime()}`).then(res => {
            if (res.data && res.data.data && res.data.data.code === 200) {

            }
          }, () => {});
        }, 500);
      },
      getQR() {
        this.axios.get( config.dev.server + `/login/qr/key?timerstamp=${new Date().getTime()}`).then(res => {
          if (res.data && res.data.data && res.data.data.code === 200) {
            this.qrKey = res.data.data.unikey;
            this.axios.get( config.dev.server + `/login/qr/create?key=${res.data.data.unikey}&qrimg=true&timerstamp=${new Date().getTime()}`).then(response => {
              console.log(response);
              const resp = response.data;
              if (resp && resp.data) {
                this.qr = resp.data.qrimg;
              }
            }, () => {
              this.$message.error('生成登录二维码失败，请刷新后再试');
            });
          }
        }, () => {
          this.$message.error('获取登录二维码失败，请刷新后再试');
        });
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
