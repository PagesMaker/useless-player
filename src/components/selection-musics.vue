<template>
      <div class="selection-music-content">
        <div class="carousel">
          <a-carousel :after-change="onCarouselChange" arrows :autoplay="true" :autoplaySpeed="5000">
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
              <div class="carousel-pics-bg" :style="{backgroundImage: item.pic ? 'url(' + item.pic + ')' : 'unset'}"></div>
              <div class="carousel-pics-content">
                <img :src="item.pic" alt="">
              </div>
            </div>
          </a-carousel>
        </div>
      </div>
</template>

<script>
    import {mainPageService} from "./service/main-page.service";
    export default {
      name: "selection-musics",
      data() {
        return {
          carouselInfo: [],

        }
      },
      mounted() {
        mainPageService.getDiscover().subscribe(res => {
          console.log(res);
          if (res.code === 200) {
            let banner = res.data.blocks.find(item => item.blockCode === 'HOMEPAGE_BANNER');
            if (banner) {
              banner.extInfo.banners = banner.extInfo.banners.filter(item => !item.adid);
              this.carouselInfo = [...banner.extInfo.banners];
            }
          }
        });
      },
      methods: {
        onCarouselChange(e) {
          console.log(e);
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
          background-color: black;
        }
        .carousel-pics{
          height: 2rem;
        }
        .carousel-pics-bg{
          position: absolute;
          width: 100%;
          height: 2rem;
          z-index: 1000;
          opacity: 0.3;
          background-repeat: no-repeat;
          background-size: 100%,100%;
          background-attachment: local;
        }
        .carousel-pics-content{
          @include flex(row, center, center);
          >img{
            z-index: $z1e4;
            cursor: pointer;
            height: 2rem;
            width: 54%;
          }
        }
        .custom-slick-arrow {
          width: 25px;
          height: 25px;
          font-size: 25px;
          z-index: $z1e4;
          color: #fff;
          background-color: rgba(31, 45, 61, 0.11);
          opacity: 0.3;
        }
        .custom-slick-arrow:before {
          display: none;
        }
       .custom-slick-arrow:hover {
          opacity: 0.5;
        }
      }
    }
  }
</style>
