<template>
    <div class="icon-group-wrapper">
      <div class="icon-group" ref="iconGroup">
        <a-icon class="blue-hover" v-show="showIcon.includes('download')" type="download" title="下载"/>
        <a-icon class="blue-hover" v-show="showIcon.includes('deleteFromList')" type="delete" title="从播放列表删除" />
        <a-icon class="blue-hover" v-show="showIcon.includes('comment')" type="message" title="评论" />
        <a-icon class="blue-hover" v-show="showIcon.includes('shared')" type="share-alt" title="分享" /><!-- todo 似乎网页不好做？待研究 -->
        <a-dropdown :getPopupContainer="getPopupContainer" v-show="showIcon.includes('addToList')" :placement="placement" :trigger="['click']"
                    overlayClassName="add-to-list-overlay-content">
          <a-icon class="blue-hover" type="plus-square" title="添加到" @click="openAddToListModal()" />
          <div slot="overlay" class="add-to-list">
            <div class="add-to-new-list" @click="addToList('new')">
              <a-icon type="plus-square" />
              <span>添加到新建歌单</span>
            </div>
            <div class="add-to-existed-list">
              <ul class="existed-listing">
                <li class="existed-list-item" @click="addToList('existed', item)" :title="item.name" v-for="item in songLists">
                  {{item.name}}
                </li>
              </ul>
            </div>
          </div>
        </a-dropdown>
        <div class="mask" v-if="showAddToListModal" @click="showAddToListModal = false"></div>
      </div>
    </div>
</template>

<script>
  import {bully} from './service/bully';
  import {SYSTEM_EVENTS} from "../Const";
    export default {
      name: "icon-group",
      data() {
          return {
            placement: 'bottomCenter',
            showAddToListModal: false,
            songLists: [],
            subscription: [],
          }
      },
      mounted() {
        const sub = bully.getMessage().subscribe(res => {
          if (res.type === SYSTEM_EVENTS.SONG_LIST_REFRESH) {
            this.songLists = res.data;
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
        getPopupContainer() {
          return this.$refs.iconGroup;
        },
        addToList(type , data = {}) {
          if (type === 'new') {
            this.$emit('addToNewList');
          } else {
            this.$emit('addToList', data.id);
          }
        },
        openAddToListModal(idx) {
          // this.$emit('addToList', idx);
          console.log(idx);
          this.showAddToListModal = true;
          bully.setMessage({
            type: SYSTEM_EVENTS.GET_SONG_LIST,
            data: {
              fromCache: true
            }
          });
        },
        closeAddToListModal() {
          this.showAddToListModal = false;
          this.$emit('cancelAddToList');
        },
      },
      props: ['showIcon', 'idx']
    }
</script>

<style scoped lang="scss">
  .mask {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  .add-to-list-overlay-content{
    z-index: $z1e7;
  }
  .add-to-list{
    @include flex(column, flex-start, flex-start);
    width: 280px;
    background-color: #fff;
    border-radius: 8px;
    font-size: 16px;
    color: black;
    box-shadow: $shadow;
    padding:  20px 0;
    .add-to-new-list{
      padding: 0 20px;
      width: 100%;
      @include flex(row, flex-start,center);
      height: 2.6em;
      span{
        margin-left: 24px;
      }
      /deep/ .anticon{
        color: black;
      }
    }
    .add-to-new-list:hover{
      cursor: pointer;
      background-color: #E7E7E7;
    }
    .add-to-existed-list{
      width: 100%;
      .existed-listing{
        @include flex(column, flex-start, flex-start);
        margin-bottom: unset;
        width: 100%;
        .existed-list-item{
          @include flex(row, flex-start, center);
          padding: 0 0 0 63px;
          width: 100%;
          height: 2.6em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow:ellipsis;
        }
        .existed-list-item:hover{
          cursor: pointer;
          background-color: #E7E7E7;
        }
      }
    }
  }
</style>
