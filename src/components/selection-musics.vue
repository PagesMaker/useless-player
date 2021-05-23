<template>
      <div class="selection-music-content">
        <div class="carousel">
          <a-carousel :after-change="onCarouselChange">
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
      height: 25%;
      /deep/ .ant-carousel{
        width: $max;
        height: $max;
        .slick-slide {
          text-align: center;
          overflow: hidden;
          background-color: black;
        }
        .carousel-pics-bg{
          position: absolute;
          background-color: #fff;
          filter: blur(8px);
          width: $max;
          height: $max;
          z-index: $z1e3;
          opacity: 0.35;
          background-repeat: no-repeat;
          background-size: $max,$max;
          background-attachment: fixed;
        }
      }
    }
  }
</style>
