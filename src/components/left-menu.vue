<template>
  <div class="left-menu-content">
    <div class="title">
      <span>useless player</span>
    </div>
    <a-menu
      :default-selected-keys="[startKeyIdx]"
      :open-keys.sync="openKeys"
      mode="inline"
      :selectedKeys="selectedKeys"
      @click="handleClick"
    >
      <a-sub-menu key="sub1" @titleClick="titleClick">
        <span slot="title"><span>在线音乐</span></span>
          <a-menu-item key="1">
              <a-icon type="customer-service" />音乐馆
          </a-menu-item>
          <a-menu-item key="2">
              <a-icon type="video-camera" />视频
          </a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="sub2" @titleClick="titleClick">
        <span slot="title"><span>我的音乐</span></span>
        <a-menu-item key="5">
          <a-icon type="star" />我喜欢
        </a-menu-item>
        <a-menu-item key="6">
          <a-icon type="history" />播放历史
        </a-menu-item>
        <a-menu-item key="7">
          <a-icon type="menu" />试听列表
        </a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="sub3">
        <span slot="title" class="my-song-title"><span>我的歌单</span><a-icon @click.stop="addSongToNewList()" type="plus"></a-icon></span>
        <a-menu-item class="song-list-item" v-if="addingNewList" :key="startKeyIdx + songLists.length">
          <a-tooltip :defaultVisible="true" placement="topLeft">
            <template slot="title">
              <span>请输入新歌单的名称</span>
            </template>
            <a-input ref="newListInput" style="width: 100%;" v-model="newListName" @keypress.enter="addNewList()" @blur="addNewList()"/>
          </a-tooltip>
        </a-menu-item>
          <a-menu-item class="song-list-item" @contextmenu.prevent.stop="openRightMenu($event, index)" @click="selectSongList(index)" :key="startKeyIdx + index" v-for="(songList, index) in songLists">
            <span v-show=" selectedEditItem.action === 'edit'? selectedEditItem.index !== index: true">{{songList.name}}</span>
            <context-menu v-if="contextMenuIdx === index" :contextMenuIdx="contextMenuIdx" @action="menuClick($event)" :contextMenu="songListContextMenu" :position="position" @close="closeRightMenu()"></context-menu>
            <a-input ref="selectedEditItems" @click.stop="" v-show="selectedEditItem.index === index && selectedEditItem.action === 'edit'" style="width: 80%;" v-model="selectedEditItem.name" :defaultValue="songList.name" @keypress.enter="renameSongList()" @blur="renameSongList()"/>
          </a-menu-item>
      </a-sub-menu>
    </a-menu>
    <div v-if="contextMenuIdx !== -1" class="outside-mask" @click.stop="closeRightMenu()" @contextmenu.prevent="closeRightMenu()">
    </div>
  </div>
</template>

<script>
  import {bully} from "./service/bully";
  import {SYSTEM_EVENTS} from "../Const";
  import {songInfoService} from "./service/song-info.service";
  import contextMenu from './context-menu';
  export default {
    name: "left-menu",
    components: {
      contextMenu
    },
    data() {
      return {
        newListName: '',
        position: {},
        contextMenuIdx: -1,
        addingNewList: false,
        openKeys: ['sub1', 'sub2', 'sub3'],
        songLists: [],
        subscription: [],
        selectedKeys: [0],
        startKeyIdx: 8,
        uid: 0,
        addToNewListData: null,
        selectedEditItem: {index: -1},
        songListContextMenu: []
      };
    },
    mounted() {
      this.songListContextMenu = [
        {
          name: '播放',
          action: this.selectSongList
        },
        {
          name: '删除',
          action: this.deleteItem
        },
        {
          name: '重命名',
          action: this.editItemName
        }
        ];
      const sub =  bully.getMessage().subscribe(res => {
        if (res.type === SYSTEM_EVENTS.GET_SONG_LIST) {
          if (res.data.fromCache) {
            bully.setMessage({
              type: SYSTEM_EVENTS.SONG_LIST_REFRESH_BY_GET_LIST,
              data: this.songLists
            })
          } else {
            this.uid = res.data.data.id;
            this.getList(SYSTEM_EVENTS.GOT_SONG_LIST_FROM_BACKEND);
          }
        }
        if (res.type === SYSTEM_EVENTS.ADD_TO_NEW_SONG_LIST) {
          this.addSongToNewList(res.data);
        }
        if (res.type === SYSTEM_EVENTS.ADD_TO_SONG_LIST) {
          songInfoService.songListEdit(
            res.data
          ).subscribe(response => {
            console.log(response);
            if (response.body.code === 200) {
              this.getList(SYSTEM_EVENTS.SONG_LIST_REFRESH, res.data);
            } else if (response.body.code === 502) {
              this.$message.warning(response.body.message);
            }
          })
        }
      })
      const rsub = bully.getRMessage().subscribe(res => {
        if (res.type ===  SYSTEM_EVENTS.SEARCH_KEYWORDS) {
          this.selectedKeys = [0];
        }
      })
      this.subscription.push(sub, rsub);
    },
    destroyed() {
      for (const ite of this.subscription) {
        if (ite) {
          ite.unsubscribe();
        }
      }
      this.subscription = null;
    },
    watch: {
      openKeys(val) {
        console.log('openKeys', val);
      },
    },
    methods: {
      editItemName() {
        this.selectedEditItem.index = this.contextMenuIdx;
        this.selectedEditItem.name = this.songLists[this.contextMenuIdx].name;
        this.selectedEditItem.action = 'edit';
        this.contextMenuIdx = -1;
        setTimeout(() => {
          this.$refs.selectedEditItems.focus();
        }, 100);
      },
      deleteItem() {
        this.selectedEditItem.index = this.contextMenuIdx;
        this.selectedEditItem.action = 'remove';
        this.contextMenuIdx = -1;
        this.$confirm({
          content: () => '你确定要删除这个歌单吗?',
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            this.removeSongList();
          },
          onCancel: () => {
            console.log('Cancel');
          }
        });
      },
      menuClick(e) {
        if (e && e instanceof Function) {
          e.apply(this);
        }
      },
      renameSongList() {
        if (!this.selectedEditItem.name || this.selectedEditItem.name === this.songLists[this.contextMenuIdx].name) {
          this.selectedEditItem.index = -1;
          return;
        }
        songInfoService.updateSongList({
          name: this.selectedEditItem.name,
          id: this.songLists[this.selectedEditItem.index].id
        }).subscribe(res => {
          if (res.code === 200) {
            this.selectedEditItem.index = -1;
            this.getList(SYSTEM_EVENTS.GOT_SONG_LIST_FROM_BACKEND);
          } else {
            this.$message.error('更新失败');
            this.selectedEditItem.index = -1;
          }
        }, () => {
          this.$message.error('更新失败');
          this.selectedEditItem.index = -1;
        });
      },
      removeSongList() {
        songInfoService.removeSongList(
         [this.songLists[this.selectedEditItem.index].id]
        ).subscribe(res => {
          this.contextMenuIdx = -1;
          if (res.code === 200) {
            this.selectSongList(this.selectedEditItem.index === this.songLists.length - 1 ? this.selectedEditItem.index - 1 : this.selectedEditItem.index);
            this.selectedEditItem.index = -1;
            this.getList(SYSTEM_EVENTS.GOT_SONG_LIST_FROM_BACKEND);
            this.$message.success('删除成功');
          } else {
            this.$message.error('删除失败');
          }
        }, () =>  {
          this.contextMenuIdx = -1;
          this.$message.error('删除失败');
        });
      },
      openRightMenu(e, idx) {
        this.closeRightMenu();
        console.log(e);
        this.position = {
          left: e.x,
          top: e.y
        }
        this.$nextTick(() => {
          this.contextMenuIdx = idx;
        });
      },
      closeRightMenu() {
        this.contextMenuIdx = -1;
      },
      addNewList() {
        if (!this.newListName.length) {
          this.addingNewList = false;
          this.addToNewListData = null;
          return;
        }
        songInfoService.addNewList(this.newListName).subscribe(res => {
          if (res.code === 200) {
            console.log(res);
            this.addingNewList = false;
            this.newListName = '';
            if (this.addToNewListData) {
              songInfoService.songListEdit(
                {
                  ...this.addToNewListData,
                  pid: res.id
                }
              ).subscribe(res => {
                console.log(res);
              })
            }
            this.getList(SYSTEM_EVENTS.SONG_LIST_REFRESH);
          }
        });
      },
      getList(type, data) {
        songInfoService.getUserPlaylist(this.uid).subscribe(res => {
          console.log(res);
          if (res.code === 200) {
            this.songLists = res.playlist;
            if (type !== SYSTEM_EVENTS.SONG_LIST_REFRESH) {
              this.selectedKeys = [this.startKeyIdx];
            }
            bully.setMessage({
              type,
              data: this.songLists,
              exData: data
            });
          }
        }, () => {
          this.$message.error('获取用户歌单失败');
        });
      },
      handleClick(e) {
        console.log('click', e);
        this.selectedKeys = [e.key];
      },
      titleClick(e) {
        console.log('titleClick', e);
      },
      selectSongList(idx = this.contextMenuIdx) {
        const data = {
          idx,
          playSong: false
        };
        if (this.contextMenuIdx !== -1) {
          this.closeRightMenu();
          data.playSong = true;
          this.selectedKeys = [idx + this.startKeyIdx];
        }
        bully.setMessage({
          type: SYSTEM_EVENTS.CHANGE_SONG_LIST,
          data
        })
      },
      addSongToNewList(data = null) {
        this.selectedKeys = [9];
        this.addingNewList = true;
        this.newListName = '';
        this.addToNewListData = data;
        this.$nextTick(() => {
          this.$refs.newListInput.focus();
        });
      }
    }
  }
</script>

<style lang="scss" scoped>
  .outside-mask{
    width: 100%;
    z-index: 100;
    height: 100%;
    position: fixed;
    background-color: unset;
    left: 0;
    top: 0;
  }
  .left-menu-content{
    background-color: #F6F6F6;
     /deep/ .ant-menu.ant-menu-inline{
      background: #F6F6F6;
    }
  }
  .title{
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    width: 100%;
    text-align: center;
    line-height: 60px;
    font-size: 26px;
  }
  .song-list-item{
    overflow: visible;
  }
  .my-song-title{
    @include flex(row, space-between, center)
  }
</style>
