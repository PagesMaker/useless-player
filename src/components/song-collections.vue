<template>
  <a-spin ref="songCollections" class="song-collections-content" :spinning="loading" @scroll="scrollToGetData">
    <div class="tags">
      <span>分类: </span>
      <a-cascader expand-trigger="hover" :options="tagList" @change="onChange">
        <a-button type="link" >{{params.cat}} > </a-button>
      </a-cascader>
    </div>
    <div class="song-collections-item">
      <div class="favorite-list-box">
        <div class="box-wrapper" v-for="(item, index) in songCollections" >
          <songs-item
            :item="item"
            :index="index"
            :size="1"
            :type="'playlists'"
            :showSingerName="false"
            :showCreatorName="true"
            :showPlayCount="true"
            :showDeleteIcon="false"
            :showListName="true"
            :selectedIndex="selectedIndex.neteaseListInfo"
            @playlistsHandle="playlistsHandle(item, $event)"
            @selectedIndexHandle="selectedIndex.neteaseListInfo = $event"
          ></songs-item>
        </div>
      </div>
      <a-back-top :target="backTop" />
    </div>
  </a-spin>
</template>

<script>
  import {mainPageService} from "./service/main-page.service";
  import {songInfoService} from "./service/song-info.service";
  import {Subject} from "rxjs";
  import {bully} from "./service/bully";
  import {SYSTEM_EVENTS} from "../Const";
  import songsItem from "./songs-item";
  import {debounceTime} from "rxjs/operators";

  export default {
    name: "song-collections",
    components: {
      songsItem
    },
    data() {
      return {
        tagList: [],
        loading: false,
        forkJoin$: [],
        songCollections: [],
        subscription: [],
        scroll$:  new Subject(),
        params: {
          limit: 35,
          cat: '全部',
          before: undefined
        },
        selectedIndex: {
          neteaseListInfo: -1
        }
      }
    },
    created() {
      this.getTagList();
      this.getAllList();
      this.songCollections = [];
    },
    mounted() {
      const sub = this.scroll$.asObservable().pipe(debounceTime(500)).subscribe(e => {
        if (e && e.target) {
          if (e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop <= 10) {
            const lastOne = this.songCollections[this.songCollections.length - 1];
            if (lastOne) {
              this.params.before = lastOne.updateTime;
              this.getAllList();
            } else {
              this.$message.warning('已经到底了');
            }
          }
        }
      });
      this.subscription.push(sub);
    },
    destroyed() {
      for (const ite of this.subscription) {
        if (ite) {
          ite.unsubscribe();
        }
      }
      this.subscription = null;
    },
    methods: {
      onChange(e) {
        this.params.cat = e[e.length - 1];
        this.songCollections = [];
        this.getAllList();
      },
      getTagList() {
        mainPageService.getTagList().subscribe(res => {
          if (res.code === 200) {
            console.log(res);
            this.tagList = [
              {
                value: '全部',
                label: '全部'
              },
              {
                value: '语种',
                label: '语种',
                children: [
                  ...res.tags.filter(item => item.category === 0).map(item => ({label: item.name, value: item.name}))
                ]
              },
              {
                value: '风格',
                label: '风格',
                children: [
                  ...res.tags.filter(item => item.category === 1).map(item => ({label: item.name, value: item.name}))
                ]
              },
              {
                value: '场景',
                label: '场景',
                children: [
                  ...res.tags.filter(item => item.category === 2).map(item => ({label: item.name, value: item.name}))
                ]
              },
              {
                value: '情感',
                label: '情感',
                children: [
                  ...res.tags.filter(item => item.category === 3).map(item => ({label: item.name, value: item.name}))
                ]
              },
              {
                value: '主题',
                label: '主题',
                children: [
                  ...res.tags.filter(item => item.category === 4).map(item => ({label: item.name, value: item.name}))
                ]
              },
            ]
          }
        });
      },
      backTop() {
        return document.getElementsByClassName('song-collections-content')[0];
      },
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
      getAllList() {
        this.loading = true;
        mainPageService.getAllSongCollections(this.params).subscribe(res => {
          if (res.code === 200) {
            console.log(res);
            this.songCollections.push(...res.playlists);
          } else {
            this.$message.error('获取歌单失败')
          }
        }, err => {
          this.$message.error('获取歌单失败')
        }, () => {
          this.loading = false;
        });
      },
      scrollToGetData(e) {
        this.scroll$.next(e);
      }
    }
  }
</script>

<style lang="scss">
  .ant-cascader-menu{
    height: auto!important;
    max-height: 400px;
  }
</style>
<style scoped lang="scss">
  .tags{
    font-size:  0.1rem;
    padding-left: 30px;
    /deep/ .ant-btn{
      font-size: 0.1rem;
    }
  }
  .song-collections-content{
    width: 100%;
    height: 100%;
    overflow: auto;
    /deep/ .ant-back-top{
      right: 25px;
      bottom: 75px;
    }
  }
  .song-collections-item{
    margin-top: 20px;
    padding-left: 20px;
    @include flex(row, center, center);
    .favorite-list-box{
      width: 98%;
      @include flex(row, flex-start, center);
      flex-wrap: wrap;
      .box-wrapper{
        width: 14%;
        height: 1.6rem;
        @include flex(row, center, center);
      }
    }
  }
</style>
