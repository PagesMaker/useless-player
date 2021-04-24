<template>
  <div>
    <div class="header-content-box">
      <div class="header-left-wrapper">
        <div class="navigate-box">
          <a-icon type="left" @click="navigateTo('back')"/>
          <a-icon type="right" @click="navigateTo('forward')" />
        </div>
        <div class="search-music-input-box">
          <a-input class="search-music-input" ref="userNameInput" @click="showSearchListing(true)" @keypress.enter="searchKeywords(searchMusic)" @blur="showSearchListing(false)" v-model="searchMusic" placeholder="搜索音乐">
            <a-icon slot="prefix" type="search" />
          </a-input>
          <search-modal @searchValueChangeByClick="searchValueChangeByClick($event)" v-if="isSearchListingShow" :searchValue="searchMusic"></search-modal>
        </div>
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
  import {fromEvent, interval, Subject} from "rxjs";
  import searchModal from './search-modal';
  import {searchService} from "./service/search.service";
  export default {
    name: 'header-content',
    components: {
      searchModal
    },
    data() {
      return {
        qr: '',
        router: [],
        qrKey: '',
        currentSearchData: {},
        searchMusic: '',
        searchInputSubject$: new Subject(),
        inSearchInterval: false,
        searchInterval$: null,
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
          UserInfos.cookie = document.cookie;
          UserInfos.isLogin = true;
          this.getLoginStatus();
        }
      }, 500);
      fromEvent(window, 'beforeunload').subscribe(() => {
        UserInfos.setLocalData();
      });
      !this.searchInterval$ && (this.searchInterval$ = interval(5000).subscribe(() => {
        this.inSearchInterval = false;
      }));
    },
    methods: {
      showSearchListing(e) {
        this.isSearchListingShow = e;
      },
      navigateTo(type) {
        if (type === 'forward') {

        } else if (type === 'back') {

        }
      },
      handleOk(e) {
        console.log(e);
      },
      gotoUserPage() {
      },
      searchValueChangeByClick(e) {
        this.searchMusic = e.data;
        this.searchKeywords(e.data, {
          type: e.type || 1,
          offset: 0,
          limit: 30
        });
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
      searchKeywords(search, data = {
        offset: 0,
        limit: 30,
        type: 1
      }) {
        // limit : 返回数量 , 默认为 30 offset : 偏移数量，用于分页 ,  如 :( 页数 -1)*30, 其中 30 为 limit 的值 , 默认为 0
        // type: 搜索类型；默认为 1 即单曲 , 取值意义 : 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频, 1018:综合
        /*bully.setMessage({
          type: SYSTEM_EVENTS.SEARCH_KEYWORDS
        })*/
        if (this.inSearchInterval) {
          this.$message.warning('搜索不能太频繁, 间隔至少要5秒钟');
          return;
        }
        this.currentSearchData  = {
          ...data,
          keywords: search
        };
        console.log(search)
        searchService.getSearchByKeywords(JSON.parse(JSON.stringify(this.currentSearchData))).subscribe(res => {
          console.log(res);
          if (res.code === 200) {
            this.inSearchInterval = true;
            for (let key in searchService.searchEnum) {
              if (searchService.searchEnum.hasOwnProperty(key)) {
                if (searchService.searchEnum[key] === data.type) {
                  this.$router.push({path:'/'});
                  res.result[key].forEach(item => {
                    item.rowName = {
                      name: item.name,
                      hover: false
                    }
                  });
                  bully.setRMessage({
                    type: SYSTEM_EVENTS.SEARCH_KEYWORDS,
                    data: {
                      type: key,
                      data: res.result
                    }
                  });
                }
              }
            }
          }
        }, error => {
          console.log(error);
          this.$message.error('网络错误');
        })
        this.showSearchListing(false);
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
                // localStorage.setItem('cookie', res.cookie);
                res.cookie.split(';;').forEach(item => {
                  console.log(item);
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
            if (res.account){
              this.account = res.account;
              UserInfos.userInfo = res.profile;
              this.userInfo = UserInfos;
              console.log(res.profile)
              UserInfos.getUserDetail(res.account.id).subscribe(resp => {
                if (resp.code === 200) {
                  console.log(resp);
                }
              });
              bully.setMessage({
                type: SYSTEM_EVENTS.GET_USER_ID,
                data: res.account
              });
              UserInfos.getLocalData();
            } else {
              UserInfos.isLogin = false;
              UserInfos.cookie = '';
            }
          }
        }, () => {
          this.$message.error('获取用户信息失败, 请刷新页面重试或者重新登录');
          UserInfos.isLogin = false;
          UserInfos.cookie = '';
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
    .header-left-wrapper{
      width: 30%;
      height: 60%;
      @include flex(row, space-between, center);
    }
    .search-music-input-box{
      @include flex(row, space-around, center);
      position: relative;
      width: 85%;
      height: 100%;
    }
    .navigate-box{
      @include flex(row, space-around, center);
      width: 8%;
      margin-left: 25px;
      height: $max;
    }
    .search-music-input{
      width: 100%;
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
