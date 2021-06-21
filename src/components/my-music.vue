<template>
  <div class="router-content">
    <played-music-list
      :columns="columns"
      v-if="mode === 'playedMusicList'"
    >
    </played-music-list>
    <my-favorite
      :columns="columns"
      v-if="mode === 'myFavorite'"
    >
    </my-favorite>

    <audition-list
      :columns="columns"
      v-if="mode === 'auditionList'"
    >
    </audition-list>

  </div>
</template>

<script>
  import {bully} from "./service/bully";
  import {SYSTEM_EVENTS} from "../Const";
  import myFavorite from "./my-favorite";
  import playedMusicList from "./played-music-list";
  import auditionList from "./audition-list";

  export default {
    name: "my-music",
    components: {
      auditionList,
      playedMusicList,
      myFavorite,
    },
    data () {
      return {
        subscription: [],
        showHeader: true,
        searchInList: false,
        crtListInfo: {},
        playingListIdx: 0,
        mode: '',
        crtHeaderType: 'playlists',
        crtListInfoIdx: 0,
        columns: [
          {
            title: '歌曲',
            dataIndex: 'rowName',
            fixed: 'left',
            width: '40%',
            scopedSlots: { customRender: 'name' },
            sorter: true,
            sortDirections: ['descend', 'ascend']
          },
          {
            title: '歌手',
            dataIndex: 'ar',
            fixed: 'left',
            width: '28%',
            scopedSlots: { customRender: 'singer' },
            sorter: true,
            sortDirections: ['descend', 'ascend']
          },
          {
            title: '专辑',
            dataIndex: 'al',
            fixed: 'left',
            width: '30%',
            scopedSlots: { customRender: 'album' },
            sorter: true,
            sortDirections: ['descend', 'ascend']
          }
        ]
      }
    },
    mounted() {
      const subR = bully.getRMessage().subscribe(res => {
        if (res.type === SYSTEM_EVENTS.SWITCH_ROUTER) {
          this.mode = res.data;
          console.log('mode', this.mode);
        }
      });
      this.subscription.push(subR);
    },
    destroyed() {
      for (const ite of this.subscription) {
        if (ite) {
          ite.unsubscribe();
        }
      }
      this.subscription = null;
    },
    methods:{
    }
  }
</script>

<style lang="scss" scoped>

</style>
