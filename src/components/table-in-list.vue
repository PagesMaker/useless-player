<template>
  <div class="inside-table-listing">
    <a-tabs v-if="!searchMode" default-active-key="1" @change="tabChanged(e)">
      <a-tab-pane key="1" :tab="'歌曲 ' + (songs ? songs.length : 0)">
        <a-table :pagination="false" class="song-listing" size="small" :columns="columns" :data-source="songs" @change="handleTableChange" :customRow="setRowBehaviour">
          <div slot="name" slot-scope="text, record, index" class="row-of-song-name" :class="currentListPlaying && currentSongIdx === index ? 'is-playing' : ''">
            <div slot="heart" class="heart-icon" >
              <a-icon class="blue-hover favourite-songs" type="heart"></a-icon>
              <span :title="text.name" class="blue-hover song-name">{{ text.name }}</span>
            </div>
            <div class="edit-area" v-if="text.hover">
              <icon-group
                :showIcon="showIcon"
                @cancelAddToList="currentSelectedRow = $event"
                @handleDownload="handleDownload(index)"
                @handleRemove="handleRemove(index)"
                @handleComment="handleComment(index)"
                @handlePlay="handlePlay(index)"
                @addToList="addToList($event, index)"
                @addToNewList="addToNewList(index)"
              ></icon-group>
            </div>
          </div>
          <span slot="singer" :title="getTitle(text)" class="row-of-singer" :class="currentListPlaying && currentSongIdx === index ? 'is-playing' : ''" slot-scope="text, record, index">
                   <span v-for="(auth, index) in text" @click="jumpToAuthorPage(auth)">
                        <span class="blue-hover">{{auth.name}}</span><span v-if="index !== text.length - 1">&nbsp;/&nbsp;</span>
                   </span>
                </span>
          <span slot="album" :title="text.name" class="blue-hover row-of-album" :class="currentListPlaying && currentSongIdx === index ? 'is-playing' : ''" slot-scope="text, record, index">{{ text.name }}</span>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="2" tab="最近收藏">

      </a-tab-pane>
      <a-tab-pane key="3" tab="评论">

      </a-tab-pane>
    </a-tabs>


    <a-tabs v-if="searchMode" default-active-key="1" @change="tabChanged(e)">
      <a-tab-pane key="1" :tab="'歌曲 ' + (songs ? songs.length : 0)">
        <a-table :pagination="false" class="song-listing" size="small" :columns="columns" :data-source="songs" :customRow="setRowBehaviour">
          <div slot="name" slot-scope="text, record, index" class="row-of-song-name" :class="currentSongIdx === index && searchMode && isPlaySearchSong ? 'is-playing' : ''">
            <div slot="heart" class="heart-icon" >
              <a-icon class="blue-hover favourite-songs" type="heart"></a-icon>
              <span :title="text.name" class="blue-hover song-name">{{ text.name }}</span>
            </div>
            <div class="edit-area" v-if="text.hover">
              <icon-group
                :showIcon="showIcon"
                :idx="index"
                @cancelAddToList="currentSelectedRow = $event"
                @handleDownload="handleDownload(index)"
                @handleRemove="handleRemove(index)"
                @handleComment="handleComment(index)"
                @handlePlay="handlePlay(index)"
                @addToList="addToList($event, index)"
                @addToNewList="addToNewList(index)"
              ></icon-group>
            </div>
          </div>
          <span slot="singer" :title="getTitle(text)" class="row-of-singer" :class="currentSongIdx === index && searchMode && isPlaySearchSong ? 'is-playing' : ''" slot-scope="text, record, index">
                   <span v-for="(auth, index) in text" @click="jumpToAuthorPage(auth)">
                        <span class="blue-hover">{{auth.name}}</span><span v-if="index !== text.length - 1">&nbsp;/&nbsp;</span>
                   </span>
                </span>
          <span slot="album":title="text.name" class="blue-hover row-of-album" :class="currentSongIdx === index && searchMode && isPlaySearchSong ? 'is-playing' : ''" slot-scope="text, record, index">{{ text.name }}</span>
          <span slot="time" :title="text" class="blue-hover row-of-album" :class="currentSongIdx === index && searchMode && isPlaySearchSong ? 'is-playing' : ''" slot-scope="text, record, index">{{ text / 1000 | timeFormat('mm:ss')}}</span>

        </a-table>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
    import {songInfoService} from "./service/song-info.service";
    import {bully} from "./service/bully";
    import {SYSTEM_EVENTS} from "../Const";
    import iconGroup from "./icon-group";
    export default {
      name: "table-in-list",
      components: {
        iconGroup
      },
      data() {
          return {
            tabs: [],
            subscription: [],
            currentSelectedRow: -1,
            showIcon: []
          }
      },
      mounted() {
        this.initShowIcons();
        const subR = bully.getRMessage().subscribe(res => {
        })
        this.subscription.push(subR);
        console.log(this.songs)
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
        handleTableChange(pagination, filters, sorter) {
          this.$emit('handleTableChange', {pagination, filters, sorter});
        },
        initShowIcons() {
          this.showIcon = ['play', 'comment', 'deleteFromList', 'download', 'shared', 'addToList'];
        },
        tabChanged(e) {},
        getTitle(data) {
          return data.map(item => item.name).join(' / ')
        },
        setRowBehaviour(data, idx) {
          return {
            on: { // 事件
              mouseenter: () => {
                this.$emit('hoverInRow', {idx, hover: true});
              },  // 鼠标移入行
              mouseleave: () => {
                this.$emit('hoverInRow', {idx, hover: false});
              },
              dblclick: () => {
                this.$emit('changeCurrentSongIdx', data);
              }
            },
            style: {
              display: !data.hidden ? 'table-row' : 'none'
            }
          };
        },
        jumpToAuthorPage(auth) {
        },
        handleDownload(idx) {
          console.log(this.songs[idx]);
          songInfoService.getSongUrl(this.songs[idx].id).subscribe(async res => {
            if (res.code === 200) {
              for (const item of res.data) {
                let response = await fetch(item.url);
                let blob = await response.blob();
                let objectUrl = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = objectUrl;
                a.download = `${this.songs[idx].name}.${item.type}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }
            } else {
              this.$message.error('获取歌曲地址失败');
            }
          }, () => {
            this.$message.error('获取歌曲地址失败');
          });
        },
        handleRemove(idx) {
          bully.setMessage({
            type: SYSTEM_EVENTS.ADD_TO_SONG_LIST,
            data: {
              op: 'del',
              tracks: this.songs[idx].id,
              pid: this.crtListInfo.id
            }
          });
        },
        handleComment(idx) {
          // todo
        },
        handlePlay(idx) {
          this.$emit('changeCurrentSongIdx', this.songs[idx]);
        },
        addToList(e, index) {
          bully.setMessage({
            type: SYSTEM_EVENTS.ADD_TO_SONG_LIST,
            data: {
              op: 'add',
              tracks: this.songs[index].id,
              pid: e
            }
          });
        },
        addToNewList(index) {
          bully.setMessage({
            type: SYSTEM_EVENTS.ADD_TO_NEW_SONG_LIST,
            data: {
              op: 'add',
              tracks: this.songs[index].id,
            }
          });
        },
        removeShowIcons(...data) {
          data.forEach(item => {
            this.showIcon = this.showIcon.filter(it => it !== item);
          })
        }
      },
      props: ['songs', 'currentSongIdx', 'columns', 'searchMode', 'isPlaySearchSong', 'currentListPlaying', 'crtListInfo'],
      watch: {
        searchMode: {
          handler(e) {
            if (e) {
              this.removeShowIcons('deleteFromList')
            }
          }
        }
      }
    }
</script>

<style scoped lang="scss">
  .inside-table-listing{
    width: 100%;
    height: 100%;
  }
  /deep/ .ant-tabs-bar{
    border: none;
  }
  /deep/ .ant-table-row{
    user-select: none;
  }
  /deep/ .ant-table-body-inner{
    min-height: 400px;
  }
  /deep/ .ant-table-small{
    border: none;
  }
  /deep/ .ant-table-fixed-left{
    width: $max;
    .ant-table-fixed{
      width: $max!important;
    }
  }
  .blue-hover{
    font-size: 1.2em;
  }
  .blue-hover:hover{
    color: $blue;
    cursor: pointer;
  }
  .is-playing{
    color: $blue;
  }
  .row-of-song-name{
    @include flex(row, space-between, center);
    width: 100%;
    max-width: 4rem;
    .heart-icon{
      @include flex(row, flex-start, center);
      width: auto;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      .song-name{
        margin-left: 10px;
      }
    }
    .edit-area{
      width: auto;
      white-space: nowrap;
    }
  }
  .row-of-singer{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    max-width: 3rem;
  }
  .row-of-album{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    max-width: 3rem;
  }
</style>
