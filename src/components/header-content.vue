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
    <a-modal class="login-modal" v-if="visible" v-model="visible" title="登录" @ok="handleOk()" @cancel="handleCancel()" :footer="null">
      <div v-if="loginProcess === 'loginHome'" class="login-content">
        <div class="login-image"></div>
        <a-tooltip placement="topLeft">
          <template slot="title">
            <span>出于安全考虑，暂时只支持扫码登录，请使用网易云音乐app进行扫码</span>
          </template>
          <a-button  type="primary" class="login-by-phone" @click="changeLoginProcess('loginByQR')">扫码登录</a-button>
        </a-tooltip>
          <a-button class="register" :disabled="true" @click="changeLoginProcess('register')">注册</a-button>
      </div>
      <div v-else-if="loginProcess === 'register'" class="login-content">

      </div>
      <div v-else-if="loginProcess === 'loginByQR'" class="login-content">
        <span>请使用网易云音乐app进行扫码</span>
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
          <span @click="changeLoginProcess('loginHome')"><a-icon style="color: #096dd9" type="left" /><a>返回</a></span>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
  import {UserInfos} from './service/user-info.service';
  import {SERVER} from "../main";
  export default {
    name: 'header-content',
    data() {
      return {
        qr: '',
        qrKey: '',
        searchMusic: '',
        account: Object,
        userInfos: UserInfos.userInfo,
        visible: false,
        loginProcess: 'loginHome', // 可能的值有 'loginHome', 'loginByQR', 'register'
        loading: false
      }
    },
    mounted() {
      if (document.cookie.includes('__csrf')) {
        this.getLoginStatus();
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
        this.changeLoginProcess('loginHome');
      },
      openLoginWindow() {
        this.visible = true;
      },
      getQR() {
        this.axios.get( SERVER + `/login/qr/key?timerstamp=${new Date().getTime()}`).then(res => {
          if (res.data && res.data.data && res.data.data.code === 200) {
            this.qrKey = res.data.data.unikey;
            this.axios.get( SERVER + `/login/qr/create?key=${res.data.data.unikey}&qrimg=true&timerstamp=${new Date().getTime()}`).then(response => {
              console.log(response);
              const resp = response.data;
              if (resp && resp.data) {
                this.qr = resp.data.qrimg;
                this.setQRInterval();
              }
            }, () => {
              this.$message.error('生成登录二维码失败，请刷新后再试');
            });
          }
        }, () => {
          this.$message.error('获取登录二维码失败，请刷新后再试');
        });
      },
      setQRInterval() {
        if (this.loginProcess !== 'loginByQR') {
          return;
        }
        this.intervalOfGetQR = setInterval(() => {
          this.axios.get( SERVER + `/login/qr/check?key=${this.qrKey}&timerstamp=${new Date().getTime()}`).then(res => {
            if (res.data && res.data.code === 800) {
              this.getQR();
              clearInterval(this.intervalOfGetQR);
            } else if (res.data && res.data.code === 801) {
              // 等待扫码
            } else if (res.data && res.data.code === 802) {
              // 等待确认
            } else if (res.data && res.data.code === 803) {
              // 扫码成功
              UserInfos.isLogin = true;
              UserInfos.cookie = res.data.cookie;
              document.cookie = res.data.cookie; // 需要将cookie保存并且设置到浏览器
              this.getLoginStatus();
              this.handleCancel();
            }
          }, () => {});
        }, 1000);
      },
      getLoginStatus() {
        this.axios.post( SERVER + `/user/account`,  {cookie: UserInfos.cookie}).then(res => {
          console.log(res);
          if (res.data.code === 200) {
            this.account = res.data.account;
            UserInfos.userInfo = res.data.profile;
            this.axios.post( SERVER + `/user/detail?uid=${res.data.account.id}`,  {cookie: UserInfos.cookie}).then(res => {
              console.log(res);
              if (res.data.code === 200) {
                console.log(res);
              }
            });
          }
        });
        this.axios.post( SERVER + `/user/subcount`,  {cookie: UserInfos.cookie}).then(res => {
          console.log(res);
          if (res.data.code === 200) {
            console.log(res);
          }
        });
      },
      changeLoginProcess(e) {
        this.loginProcess = e;
        if (this.loginProcess === 'loginByQR') {
          this.getQR();
        } else {
          clearInterval(this.intervalOfGetQR);
        }
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
