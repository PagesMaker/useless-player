<template>
  <a-spin :spinning="loading">
    <div class="selection-music-content">
        <div class="list-netease rank-list" style="margin-top: 0">
          <div class="rank-list-content list-netease-content">
            <div class="rank-list-wrapper box-wrapper"  @mouseenter="selectedIndex.topRankList = index"  @mouseleave="selectedIndex.topRankList = -1" v-for="(item, index) in topRankList" @click="playlistsHandle(item, 'rankList')">
              <div class="rank-list-l">
                <div class="rank-list-l-wrapper">
                  <div class="list-bg" :style="{backgroundImage: item.coverImgUrl ? 'url(' + item.coverImgUrl + '?param=250y250' + ')'  : 'unset'}">
                    <div class="listen-times">
                      <a-icon type="customer-service" />
                      <span>{{item.playCount | tenThousands(1)}}</span>
                    </div>
                    <div class="box-wrapper-mask" v-show="selectedIndex.topRankList === index">
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
    <div class="rank-list-simple-item">
      <div class="favorite-list-box">
        <div class="box-wrapper" v-for="(item, index) in restRankList" >
          <songs-item
            :item="item"
            :index="index"
            :size="0.8"
            :type="'playlists'"
            :showSingerName="false"
            :showPlayCount="true"
            :showDeleteIcon="false"
            :showListName="false"
            :selectedIndex="selectedIndex.neteaseListInfo"
            @playlistsHandle="playlistsHandle(item, $event)"
            @selectedIndexHandle="selectedIndex.neteaseListInfo = $event"
          ></songs-item>
        </div>
      </div>
    </div>
  </a-spin>
</template>

<script>
    import {mainPageService} from "./service/main-page.service";
    import {songInfoService} from "./service/song-info.service";
    import {forkJoin} from "rxjs";
    import {bully} from "./service/bully";
    import {SYSTEM_EVENTS} from "../Const";
    import songsItem from "./songs-item";

    export default {
      name: "rank-list",
      components: {
        songsItem
      },
      data() {
        return {
          loading: false,
          forkJoin$: [],
          topRankList: [],
          restRankList: [],
          selectedIndex: {
            topRankList: -1,
            neteaseListInfo: -1
          }
        }
      },
      created() {
        this.getAllRankList();
      },
      methods: {
        playlistsHandle (...args) {
          this.goToList(...args);
        },
        goToList(res, key) {
          bully.setRMessage({
            type: SYSTEM_EVENTS.MULTI_PURPOSE_HANDLE,
            data: {
              ...res,
              type: key
            }
          });
          this.$router.push({name : 'list-view'});
        },
        getAllRankList() {
          mainPageService.getAllRankList().subscribe(res => {
            if (res.code === 200) {
              res.list.map(item => item.selectedIndex = -1);
              this.topRankList = res.list.slice(0, 6);
              this.restRankList = res.list.slice(6, res.list.length - 6);
              console.log(this.topRankList);
              this.forkJoin$ = [];
              this.topRankList.forEach(item => {
                this.forkJoin$.push(songInfoService.getPlaylistDetail(item.id));
              });
              forkJoin(this.forkJoin$).pipe().subscribe(res => {
                // forkjoin的response 不会打乱 请求的顺序
                console.log(res, 'forkjoin');
                res.forEach((item, index) => {
                  if (item.code === 200) {
                    this.topRankList[index] = {...this.topRankList[index],  playlist: item.playlist.tracks.slice(0, 5)};
                  } else {
                    this.$message.error('加载排行榜数据失败');
                  }
                });
                this.topRankList = [...this.topRankList];
              }, () => {
                this.$message.error('加载排行榜数据失败');
              });
            }
          });
        }
      }
    }
</script>

<style scoped lang="scss">
  .rank-list-simple-item{
    margin-top: 30px;
    .favorite-list-box{
      width: 98%;
      @include flex(row, flex-start, center);
      flex-wrap: wrap;
      .box-wrapper{
        width: 10%;
        height: 1.2rem;
        @include flex(row, center, center);
      }
    }
  }
</style>
