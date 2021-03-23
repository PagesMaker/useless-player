<template>
  <div>
    <div class="header-content-box">
      <div class="search-music-input-box">
        <a-input class="search-music-input" ref="userNameInput" @focus="showSearchListing(true)" @blur="" v-model="searchMusic" placeholder="搜索音乐">
          <a-icon slot="prefix" type="search" />
        </a-input>
        <search-modal @searchValueChangeByClick="searchMusic = $event" v-if="isSearchListingShow" :searchValue="searchMusic"></search-modal>
      </div>
      <div class="user-infos">
        <div v-if="userInfo.isLogin" class="user-infos-box">
          <img class="user-avatar" :src="userInfo.userInfo.avatarUrl" alt="">
          <span>{{userInfo.isLogin ? userInfo.userInfo.nickname : '请登录'}}</span>
        </div>
        <div v-else class="user-header" @click="!userInfo.isLogin ? openLoginWindow() : gotoUserPage()">
          <a-icon type="user" />
          <span>请登录</span>
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
  import {bully} from "./service/bully";
  import {SYSTEM_EVENTS} from "../Const";
  import {Subject} from "rxjs";
  import searchModal from './search-modal';

  export default {
    name: 'header-content',
    components: {
      searchModal
    },
    data() {
      return {
        qr: '',
        qrKey: '',
        searchMusic: '',
        searchInputSubject$: new Subject(),
        account: Object,
        userInfo: UserInfos,
        visible: false,
        loginProcess: 'loginHome', // 可能的值有 'loginHome', 'loginByQR', 'register'
        loading: false,
        isSearchListingShow: false
      }
    },
    mounted() {
      setTimeout(() => {
        if (document.cookie.includes('__csrf')) {
          UserInfos.cookie = document.cookie + '; HTTPOnly';
          UserInfos.isLogin = true;
          this.getLoginStatus();
        }
      }, 500);
    },
    methods: {
      showSearchListing(e) {
        this.isSearchListingShow = e;
      },
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
        UserInfos.loginByQr(new Date().getTime()).subscribe(res => {
          if (res && res.code === 200) {
            this.qrKey = res.data.unikey;
            UserInfos.createQr(res.data.unikey, new Date().getTime()).subscribe(response => {
              console.log(response);
              const resp = response.data;
              if (resp) {
                this.qr = resp.qrimg;
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
            UserInfos.setQrInterval(this.qrKey, new Date().getTime()).subscribe(res => {
              if (res && res.code === 800) {
                this.getQR();
                clearInterval(this.intervalOfGetQR);
              } else if (res && res.code === 801) {
                // 等待扫码
              } else if (res && res.code === 802) {
                // 等待确认
              } else if (res && res.code === 803) {
                // 扫码成功
                UserInfos.isLogin = true;
                UserInfos.cookie = res.cookie;
                res.cookie.split(';;').forEach(item => {
                  item = item.split('HTTPOnly')[0];
                  document.cookie = item;
                })
                // 需要将cookie保存并且设置到浏览器
                this.getLoginStatus();
                this.handleCancel();
              }
            });
        }, 1000);
      },
      getLoginStatus() {
        UserInfos.getUserAccount().subscribe(res => {
          console.log(res);
          if (res.code === 200) {
            if ( res.account ){
              this.account = res.account;
              UserInfos.userInfo = res.profile;
              this.userInfo = UserInfos;
              UserInfos.getUserDetail(res.account.id).subscribe(resp => {
                if (resp.code === 200) {
                  console.log(resp);
                }
              });
              bully.setMessage({
                type: SYSTEM_EVENTS.GET_USER_ID,
                data: res.account
              });
            } else {
              UserInfos.isLogin = false;
              UserInfos.cookie = '';
            }
          }
        }, () => {
          this.$message.error('获取用户信息失败');
        });
        UserInfos.getUserSubcount().subscribe(res => {
          console.log(res);
          if (res.code === 200) {
            console.log(res);
          }
        })
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
    padding: 10px 0;
    @include flex(row, space-between, center);
    /deep/ .anticon.anticon-user{
      font-size:2em;
    }
    .search-music-input-box{
      position: relative;
      width: 24%;
      height: 60%;
      margin-left: 20px;
    }
    .search-music-input{
      width: $max;
      height: $max;
      /deep/ .ant-input{
        border-radius: 30px;
        background-color: #E3E3E3;
      }
      /deep/ .ant-input:focus{
        border: none;
        box-shadow: unset;
      }
    }
    .user-infos{
      width: 20%;
      height: auto;
      @include flex(row, center, center);
      >span{
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
      @include flex(column, space-between, center);
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
  .user-infos-box{
    color: $black;
    @include flex(row, flex-start, center);
    .user-avatar{
      width: 30px;
      height: 30px;
      border-radius: 30px;
    }
    .user-avatar + span{
      margin-left: 10px;
    }
    .user-avatar + span:hover{
      color: $blue;
      cursor: pointer;
    }
  }
</style>
