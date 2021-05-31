<template>
    <div class="main-page-content">
      <p>音乐馆</p>
      <div class="main-page-tabs">
        <a-tabs default-active-key="0" @change="tabChanged($event)">
          <a-tab-pane v-for="(item, index) in tabs" :key="index + ''" :tab="item">
            <selection-musics v-if="item === '精选'"
            ></selection-musics>
            <rank-list v-else-if="item === '排行榜'"
            ></rank-list>
            <song-collections v-else-if="item === '歌单'"
                              :type="'songList'"
            ></song-collections>
            <musician-list v-else-if="item === '歌手'"
            ></musician-list>
            <song-collections v-else-if="item === '新碟上新'"
                              :type="'album'"
            ></song-collections>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
</template>

<script>
    import {mainPageService} from "./service/main-page.service";
    import selectionMusics from "./selection-musics";
    import rankList from "./rank-list";
    import songCollections from "./song-collections";
    import musicianList from "./musician-list";
    export default {
      name: "main-page",
      components: {
        selectionMusics,
        rankList,
        songCollections,
        musicianList
      },
      data() {
          return {
            tabs: mainPageService.mainPageTabItem,
          }
      },
      mounted() {
      },
      methods: {
        tabChanged(e) {

        }
      },
    }
</script>

<style scoped lang="scss">
  .main-page-content{
    width: $max;
    height: $max;
    >p{
      font-size: 2em;
      font-weight: 800;
      margin: 0 0 0 15px;
    }
    .main-page-tabs{
      width: $max;
      height: calc(100% - 2em - 15px);
      /deep/ .ant-tabs{
        width: $max;
        height: $max;
        .ant-tabs-content{
          width: $max;
          height: calc(100% - 46px - 16px);
          overflow: auto;
        }
      }
    }
  }
</style>
