<template>
      <div class="selection-music-content">
        <div class="carousel">
          <a-carousel :before-change="onCarouselChange" arrows :autoplay="true" :autoplaySpeed="5000">
            <div
              slot="prevArrow"
              slot-scope="props"
              class="custom-slick-arrow"
              style="left: 10px"
            >
              <a-icon type="left-circle" />
            </div>
            <div
              slot="nextArrow"
              slot-scope="props"
              class="custom-slick-arrow"
              style="right: 10px"
            >
              <a-icon type="right-circle" />
            </div>
            <div class="carousel-pics" v-for="(item, index) in carouselInfo" @click="redirectPage(item)">
              <div class="carousel-pics-bg" v-show="index === currentCarouselIdx" :style="{backgroundImage: item.pic ? 'url(' + item.pic + '?param=250y250' + ')' : 'unset'}"></div>
              <div class="carousel-pics-content">
                <img :src="item.pic" alt="">
              </div>
            </div>
          </a-carousel>
        </div>
        <div class="list-netease">
          <div class="list-netease-header">
            <div class="header-left">
              <span class="list-name">官方歌单</span><span class="list-name-desc">官方甄选订阅歌单</span>
            </div>
            <div class="header-right">
              <span class="list-more">更多&nbsp;<a-icon type="right"/></span>
            </div>
          </div>
          <div class="list-netease-content">
            <div class="box-wrapper" v-for="(item, index) in neteaseListInfo">
              <div class="list-bg-wrapper"  @mouseenter="item.selectedIndex = index"  @mouseleave="item.selectedIndex = -1">
                <div class="list-bg" :style="{backgroundImage: item.uiElement.image ? 'url(' + item.uiElement.image.imageUrl + '?param=250y250'  + ')'  : 'unset'}">
                  <div class="listen-times">
                    <a-icon type="customer-service" />
                    <span>{{item.resources && item.resources[0].resourceExtInfo.playCount | tenThousands(1)}}</span>
                  </div>
                  <div class="box-wrapper-mask" v-show="item.selectedIndex === index">
                    <a-icon type="play-circle" title="播放" theme="filled"/>
                  </div>
                </div>
              </div>
              <div class="list-link">
                <span>{{item.uiElement.mainTitle && item.uiElement.mainTitle.title}}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="list-netease">
          <div class="list-netease-header">
            <div class="header-left">
              <span class="list-name">新碟上架</span><span class="list-name-desc">获取最新专辑</span>
            </div>
            <div class="header-right">
              <span class="list-more">更多&nbsp;<a-icon type="right"/></span>
            </div>
          </div>
          <div class="list-netease-content new-album">
              <div class="box-wrapper" v-for="(item, index) in albumInfo">
                <div class="list-bg-wrapper"  @mouseenter="item.selectedIndex = index"  @mouseleave="item.selectedIndex = -1">
                  <div class="list-bg" :style="{backgroundImage: item.picUrl ? 'url(' + item.picUrl + ')'  : 'unset'}">
                    <div class="box-wrapper-mask" v-show="item.selectedIndex === index">
                      <a-icon type="play-circle" title="播放" theme="filled"/>
                    </div>
                  </div>
                </div>
                <div class="list-link">
                  <span>{{item.name}}</span>
                  <br/>
                  <span>{{item.artist.name}}</span>
                </div>
              </div>
          </div>
        </div>
        <div class="list-netease rank-list">
          <div class="list-netease-header">
            <div class="header-left">
              <span class="list-name">排行榜</span><span class="list-name-desc">获取最热歌曲</span>
            </div>
            <div class="header-right">
              <span class="list-more">更多&nbsp;<a-icon type="right"/></span>
            </div>
          </div>
          <div class="rank-list-content">
            <div class="rank-list-wrapper" v-for="(item, idx) in  rankList">
              <div class="rank-list-l">
                <div class="rank-list-l-wrapper">
                  <div class="list-bg">
                    <div class="listen-times">
                      <a-icon type="customer-service" />
                      <span>{{item.playCount | tenThousands(1)}}</span>
                    </div>
                    <div class="box-wrapper-mask" v-show="item.selectedIndex === idx">
                      <a-icon type="play-circle" title="播放" theme="filled"/>
                    </div>
                  </div>
                </div>
                <div class="list-link">
                  <span>{{item.name}}</span>
                </div>
              </div>
              <div class="rank-list-r">
                <div class="rank-list-header">{{item.name}}</div>
                <div ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
</template>

<script>
    import {mainPageService} from "./service/main-page.service";
    import {SYSTEM_EVENTS} from "../Const";
    import {songInfoService} from "./service/song-info.service";
    import {forkJoin} from "rxjs";

    export default {
      name: "selection-musics",
      data() {
        return {
          carouselInfo: [],
          currentCarouselIdx: 0,
          neteaseListInfo: [],
          albumInfo: [],
          forkJoin$: [],
          rankList: []
        }
      },
      mounted() {
        this.getHomeInfo();
      },
      methods: {
        onCarouselChange(from, to) {
          this.currentCarouselIdx = to;
        },
        redirectPage(e) {

        },
        getHomeInfo() {
          mainPageService.getHomeMainPage().subscribe(res => {
            console.log(res);
            if (res.code === 200) {
              const banner = res.data.blocks.find(item => item.blockCode === SYSTEM_EVENTS.HOMEPAGE_BANNER);
              if (banner) {
                banner.extInfo.banners = banner.extInfo.banners.filter(item => !item.adid);
                this.carouselInfo = [...banner.extInfo.banners];
              }
              const list = res.data.blocks.find(item => item.blockCode === SYSTEM_EVENTS.HOMEPAGE_BLOCK_PLAYLIST_RCMD);
              if (list) {
                if ( list.creatives.length > 6 ) {
                  list.creatives.length = 6;
                }
                list.creatives.map(item => item.selectedIndex = -1);
                this.neteaseListInfo = [...list.creatives.filter(item => item.uiElement)];
              }
            }
          });
          mainPageService.getNewAlbum().subscribe(res => {
            if (res.code === 200) {
              console.log(res);
              res.albums.map(item => item.selectedIndex = -1);
              this.albumInfo = [...res.albums];
              console.log(this.albumInfo)
            }
          });
          mainPageService.getAllRankList().subscribe(res => {
            if (res.code === 200) {
              res.list.map(item => item.selectedIndex = -1);
              this.rankList = res.list.slice(0, 6);
              console.log(this.rankList);
              this.forkJoin$ = [];
              this.rankList.forEach(item => {
                this.forkJoin$.push(songInfoService.getPlaylistDetail(item.id));
              });
              forkJoin(this.forkJoin$).pipe().subscribe(res => {
                console.log(res, 'forkjoin');

              }, error => {
                console.log(error,  'forkjoin')
              });
            }
          })
        }
      }
    }
</script>

<style scoped lang="scss">
  .selection-music-content{
    width: $max;
    height: $max;
    overflow: auto;
    @include flex(column, flex-start, center);
    .carousel{
      width: 98%;
      /deep/ .ant-carousel{
        width: $max;
        .slick-slide {
          text-align: center;
          height: 2rem;
          overflow: hidden;
          background-color: white;
        }
        .carousel-pics{
          height: 2rem;
        }
        .carousel-pics-bg{
          position: absolute;
          width: 100%;
          height: 2rem;
          z-index: 1000;
          opacity: 0.8;
          filter: blur(20px);
          background-repeat: round;
          background-attachment: local;
        }
        .carousel-pics-content{
          @include flex(row, center, center);
          >img{
            z-index: $z1e4;
            cursor: pointer;
            height: 2rem;
            width: 50%;
          }
        }
        .custom-slick-arrow {
          width: 25px;
          height: 25px;
          font-size: 25px;
          z-index: $z1e4;
          color: rgb(31, 45, 61);
          opacity: 0.7;
        }
        .custom-slick-arrow:before {
          display: none;
        }
       .custom-slick-arrow:hover {
          opacity: 0.5;
        }
      }
    }
    .list-netease{
      margin-top: 20px;
      width: 98%;
      @include flex(column, flex-start, flex-start);
      font-size: 1em;
      .list-netease-header{
        @include flex(row, space-between, center);
        width: 100%;
        height: 50px;
        color: grey;
        .header-right .list-more:hover{
          color: $blue;
          cursor: pointer;
          /deep/ .anticon{
            color: $blue;
            cursor: pointer;
          }
        }
        .header-left{
          @include flex(row, space-between, center);
          .list-name{
            font-size: 2em;
            font-weight: 500;
            color: black;
          }
          .list-name-desc{
            margin-left: 32px;
          }
        }
      }
      .new-album.list-netease-content{
        margin-top: 0!important;
        width: $max;
        flex-wrap: wrap;
        .box-wrapper{
          margin-right: calc((100% - 6 * 1.2rem) / 5);
          margin-top: 20px;
        }
        .box-wrapper:last-child{
          margin-right:0
        }
        .box-wrapper:nth-child(6n){
          margin-right:0
        }
      }
      .list-netease-content{
        margin-top: 20px;
        width: $max;
        height: auto;
        color: black;
        @include flex(row, space-between, flex-start);
        .box-wrapper{
          width: 1.2rem;
          @include flex(column, flex-start, space-between);
          .list-bg-wrapper{
            width: 1.2rem;
            height: 1.2rem;
          }
          .list-bg{
            background-repeat: round;
            background-attachment: local;
            position: relative;
            width: 1.2rem;
            height: 1.2rem;
            border-radius: 5%;
            .box-wrapper-mask{
              position: absolute;
              top: 0;
              left: 0;
              opacity: 0.4;
              border-radius: 5%;
              @include flex(column, center, center);
              width: $max;
              height: $max;
              background-color: rgba(0,0,0,0.75);
              /deep/ .anticon{
                color: white;
                font-size: 4em;
                -webkit-animation: showMask 0.25s linear normal;
                -moz-animation: showMask 0.25s linear normal;
                animation: showMask 0.25s linear normal;
                animation-fill-mode: forwards;
              }
              /deep/ .anticon:hover{
                color: $deepBlue;
              }
            }
          }
          .list-bg-wrapper:hover {
            cursor: pointer;
            -webkit-animation: moveIn 0.25s linear normal;
            -moz-animation: moveIn 0.25s linear normal;
            animation: moveIn 0.25s linear normal;
            animation-fill-mode: forwards;
          }
          .box-wrapper-mask:hover{
            -webkit-animation: showMask 0.25s linear normal;
            -moz-animation: showMask 0.25s linear normal;
            animation: showMask 0.25s linear normal;
            animation-fill-mode: forwards;
          }
          .list-link{
            margin-top: 10px;
          }
          .list-link span:hover{
            color: $blue;
            cursor: pointer;
          }
        }
      }
    }
    .listen-times{
      position: absolute;
      bottom: 5%;
      right: 5%;
      padding: 1px 10px;
      background-color: rgba(0,0,0,0.75);
      border-radius: 20px;
      color: white;
      /deep/ .anticon{
        color: white;
      }
    }
  }
  @keyframes showMask{
    0%  {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }
  @keyframes moveIn{
    0%  {
      margin-top: 0;
    }
    100% {
      margin-top: -20px;
      padding-bottom: 20px;
      height: calc(1.2rem + 20px);
    }
  }
</style>
