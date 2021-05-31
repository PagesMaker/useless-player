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
              <div class="carousel-pics-bg" v-show="index === currentCarouselIdx" :style="{backgroundImage: item.pic ? 'url(' + item.pic + ')' : 'unset'}"></div>
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
            <div class="box-wrapper" v-for="item in neteaseListInfo">
              <div class="list-bg" :style="{backgroundImage: item.uiElement.image ? 'url(' + item.uiElement.image.imageUrl + ')'  : 'unset'}">
                <div class="listen-times">
                  <a-icon type="customer-service" />
                  <span>{{item.resources && item.resources[0].resourceExtInfo.playCount | tenThousands(1)}}</span>
                </div>
              </div>
              <div class="list-link">
                <span>{{item.uiElement.mainTitle && item.uiElement.mainTitle.title}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
</template>

<script>
    import {mainPageService} from "./service/main-page.service";
    import {SYSTEM_EVENTS} from "../Const";
    export default {
      name: "selection-musics",
      data() {
        return {
          carouselInfo: [],
          currentCarouselIdx: 0,
          neteaseListInfo: []
        }
      },
      mounted() {
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
              this.neteaseListInfo = [...list.creatives.filter(item => item.uiElement)];
            }
          }
        });
      },
      methods: {
        onCarouselChange(from, to) {
          this.currentCarouselIdx = to;
        },
        redirectPage(e) {

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
      width: 98%;
      @include flex(column, flex-start, center);
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
      .list-netease-content{
        width: $max;
        height: $max;
        color: black;
        @include flex(row, space-between, flex-start);
        .box-wrapper{
          width: 1.2rem;
          @include flex(column, flex-start, flex-start);
          .list-bg{
            background-repeat: round;
            background-attachment: local;
            position: relative;
            width: 1.2rem;
            height: 1.2rem;
            border-radius: 5%;
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
          .list-link{
            margin-top: 10px;
          }
          .list-link:hover{
            color: $blue;
            cursor: pointer;
          }
        }
      }
    }
  }
</style>
