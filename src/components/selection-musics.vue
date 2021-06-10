<template>
     <a-spin :spinning="loading">
       <div class="selection-music-content">
         <div class="carousel" v-if="carouselInfo.length">
           <a-carousel ref="carousel" :before-change="onCarouselChange" arrows :autoplay="true" :autoplaySpeed="5000">
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
             <div class="carousel-pics" v-for="(item, index) in carouselInfo" @click="carouselClicked(item)">
               <div class="carousel-pics-bg" v-show="index === currentCarouselIdx" :style="{backgroundImage: item.imageUrl ? 'url(' + item.imageUrl + '?param=250y250' + ')' : 'unset'}"></div>
               <div class="carousel-pics-content">
                 <img :src="item.imageUrl" alt="">
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
               <div class="list-bg-wrapper"  @mouseenter="selectedIndex.neteaseListInfo = index"  @mouseleave="selectedIndex.neteaseListInfo = -1">
                 <div class="list-bg" :style="{backgroundImage: item.picUrl ? 'url(' + item.picUrl + '?param=250y250'  + ')'  : 'unset'}">
                   <div class="listen-times">
                     <a-icon type="customer-service" />
                     <span>{{item.playCount | tenThousands(1)}}</span>
                   </div>
                   <div class="box-wrapper-mask" v-show="selectedIndex.neteaseListInfo === index">
                     <a-icon type="play-circle" title="播放" theme="filled"/>
                   </div>
                 </div>
               </div>
               <div class="list-link">
                 <span>{{item.name}}</span>
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
               <div class="list-bg-wrapper"  @mouseenter="selectedIndex.albumInfo = index"  @mouseleave="selectedIndex.albumInfo = -1">
                 <div class="list-bg" :style="{backgroundImage: item.picUrl ? 'url(' + item.picUrl + '?param=250y250' + ')'  : 'unset'}">
                   <div class="box-wrapper-mask" v-show="selectedIndex.albumInfo === index">
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
           <div class="rank-list-content list-netease-content">
             <div class="rank-list-wrapper box-wrapper"  @mouseenter="selectedIndex.ranklist = index"  @mouseleave="selectedIndex.ranklist = -1" v-for="(item, index) in rankList">
               <div class="rank-list-l">
                 <div class="rank-list-l-wrapper">
                   <div class="list-bg" :style="{backgroundImage: item.coverImgUrl ? 'url(' + item.coverImgUrl + '?param=250y250' + ')'  : 'unset'}">
                     <div class="listen-times">
                       <a-icon type="customer-service" />
                       <span>{{item.playCount | tenThousands(1)}}</span>
                     </div>
                     <div class="box-wrapper-mask" v-show="selectedIndex.ranklist === index">
                       <a-icon type="play-circle" title="播放" theme="filled"/>
                     </div>
                   </div>
                 </div>
               </div>
               <div class="rank-list-r">
                 <div class="rank-list-header"><span>{{item.name}}</span></div>
                 <div class="rank-list-row">
                   <div class="rank-list-r-item" v-for="(tracks, idx) in item.playlist || []">
                     <span>{{idx + 1 + '.'}}</span><span>{{tracks.name}}</span><span>&nbsp;-&nbsp;</span>
                     <div v-for="(ar, i) in tracks.ar"><span>{{ar.name}}</span><span v-if="i !== tracks.ar.length - 1">/</span></div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
       <page-footer></page-footer>
     </a-spin>
</template>

<script>
    import {mainPageService} from "./service/main-page.service";
    import {searchService} from "./service/search.service";
    import {songInfoService} from "./service/song-info.service";
    import {forkJoin} from "rxjs";
    import pageFooter from './page-footer';

    export default {
      name: "selection-musics",
      components: {pageFooter},
      data() {
        return {
          selectedIndex: {
            neteaseListInfo: -1,
            albumInfo: -1,
            ranklist: -1
          },
          carouselInfo: [],
          loading: true,
          currentCarouselIdx: 0,
          neteaseListInfo: [],
          albumInfo: [],
          defaultOffset: 6,
          forkJoin$: [],
          rankList: []
        }
      },
      mounted() {
        this.getHomeInfo();
        setTimeout(() => {
          this.loading = false;
          this.$refs.carousel.next();
        }, 1500);
      },
      methods: {
        onCarouselChange(from, to) {
          this.currentCarouselIdx = to;
        },
        carouselClicked(e) {
          for (const key in searchService.searchEnum) {
            if (searchService.searchEnum.hasOwnProperty(key)) {
              if (searchService.searchEnum[key] === e.targetType) {
                this[key + 'Handle'].apply(this, e);
                return;
              }
            }
          }
        },
        songsHandle (e) {

        },
        artistsHandle (e) {

        },
        playlistsHandle (e) {

        },
        albumsHandle (e) {

        },
        userHandle (e) {

        },
        mvHandle (e) {

        },
        lyricsHandle (e) {

        },
        radioHandle (e) {

        },
        videoHandle (e) {

        },
        comprehensiveHandle (e) {

        },
        getHomeInfo() {
          mainPageService.getHomeMainPagePic(0).subscribe(res => {
            console.log(res);
            if (res.code === 200) {
              console.log(res);
              this.carouselInfo = [...res.banners.filter(item => !item.adid)];
            } else {
              this.$message.error('加载首页轮播图失败');
            }
          }, () => {
            this.$message.error('加载首页轮播图失败');
          });
          mainPageService.getPersonalization(this.defaultOffset).subscribe(res => {
            if (res.code === 200) {
              console.log(res);
              this.neteaseListInfo = [...res.result];
            } else {
              this.$message.error('加载推荐歌单失败');
            }
          }, () => {
            this.$message.error('加载推荐歌单失败');
          });
          mainPageService.getNewAlbum().subscribe(res => {
            if (res.code === 200) {
              console.log(res);
              res.albums.map(item => item.selectedIndex = -1);
              this.albumInfo = [...res.albums];
              console.log(this.albumInfo)
            } else {
              this.$message.error('加载最新专辑数据失败');
            }
          }, () => {
            this.$message.error('加载最新专辑数据失败');
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
                // forkjoin的response 不会打乱 请求的顺序
                console.log(res, 'forkjoin');
                res.forEach((item, index) => {
                  if (item.code === 200) {
                    this.rankList[index] = {...this.rankList[index],  playlist: item.playlist.tracks.slice(0, 5)};
                  } else {
                    this.$message.error('加载排行榜数据失败');
                  }
                });
              }, () => {
                this.$message.error('加载排行榜数据失败');
              });
            }
          });
        }
      },
      props: ['isCurrent'],
      watch: {
        isCurrent: {
          handler(val) {
            if (val === true) {
              /*setTimeout(() => {
                this.loading = false;
                this.$refs.carousel.next();
              }, 1500);
              this.getHomeInfo();*/
            }
          }
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
            border-radius: 20px;
            .box-wrapper-mask{
              position: absolute;
              top: 0;
              left: 0;
              opacity: 0;
              border-radius: 20px;
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
      .rank-list-content:hover{
        cursor: pointer;
      }
      .rank-list-content{
        margin-top: 0px;
        width: $max;
        height: auto;
        color: black;
        @include flex(row, flex-start, flex-start);
        flex-wrap: wrap;
        .box-wrapper{
          margin-right: 5%;
        }
        .box-wrapper:nth-child(3n){
          margin-right:0
        }
        .rank-list-wrapper {
          background-color: #EFEFEF;
          margin-top: 20px;
          @include flex(row, flex-start, center);
          width: 30%;
          border-radius: 20px;
          .rank-list-l{
            .rank-list-l-wrapper:hover{
              cursor: pointer;
            }
            .rank-list-l-wrapper{
              width: 1.2rem;
              height: 1.2rem;
            }
          }
          .rank-list-r{
            padding: 0.1rem;
            width: calc(100% - 1.2rem);
            height: 1.2rem;
            @include flex(column, flex-start, flex-start);
            .rank-list-header{
              width: fit-content;
              font-size: 1.5em;
              height: auto;
              @include flex(row, flex-start, center);
              min-height: 30px;
              color: black;
              font-weight: 500;
              span{
                @include noWrap(hidden, visible, nowrap, ellipsis);
              }
            }
            .rank-list-row{
              @include flex(column, space-between, flex-start);
              height: calc(100% - 1.5em);
              padding: 0.05rem 0;
              width: $max;
              .rank-list-r-item{
                font-size: 1em;
                width: $max;
                color: $deepGray;
                font-weight: 400;
                @include noWrap(hidden, hidden, nowrap, ellipsis);
                @include flex(row, flex-start, center);
              }
            }
          }
        }
        .rank-list-wrapper:hover{
          -webkit-animation: moveInRankList 0.25s linear normal;
          -moz-animation: moveInRankList 0.25s linear normal;
          animation: moveInRankList 0.25s linear normal;
          animation-fill-mode: forwards;
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
      opacity: 0;
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
  @keyframes moveInRankList{
    0%  {
      margin-top: 20px;
    }
    100% {
      margin-top: 5px;
    }
  }
</style>
