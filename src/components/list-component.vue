<template>
    <div class="router-content">
      <div class="music-list">
        <div class="music-list-header">
          <div v-if="listInfo.listImageSrc" class="music-list-img-box">
            <img :src="listInfo.listImageSrc" alt="">
          </div>
          <div v-else class="music-list-img-box">
            <i class="fa fa-music"></i>
          </div>
          <div class="list-infos-box">
            <div class="list-name">
              {{listInfo.listName}}
            </div>
            <div :style="{'display': userInfo ? 'block' : 'none'}" class="user-infos-box">
              <img :src="userInfo.imgSrc" alt="">
              <span>{{userInfo.name}}</span>
            </div>
            <div class="user-infos-box">
              <span>精心完善歌单信息有机会获得推荐，让更多用户看到你的大作</span>
            </div>
            <div class="btn-area">
              <a-button >
                <a-icon type="play-circle" title="播放" theme="outlined" />
                <span>播放全部</span>
              </a-button>
              <a-button >
                <a-icon type="download" title="下载"/>
                <span>下载</span>
              </a-button>
              <a-button >
                <a-icon type="delete" title="删除" />
                <span>删除</span>
              </a-button>
              <a-button >
                <a-icon type="menu" title="排序" />
                <span>排序</span>
              </a-button>
              <a-button v-if="!searchMode" @click="toggleSearch(true)">
                <a-icon type="search" title="搜索" />
                <span>搜索</span>
              </a-button>
              <a-input v-model="searchText" v-else>
                <a-icon slot="prefix" @click="toggleSearch(false)" type="close" />
              </a-input>
              <a-button v-if="isEditMode">
                <span>退出批量操作</span>
              </a-button>
            </div>
          </div>
        </div>
        <div class="music-list-body">
          <a-tabs default-active-key="1" @change="callback">
            <a-tab-pane key="1" :tab="'歌曲 ' + (listInfo.songs ? listInfo.songs.length : 0)">

            </a-tab-pane>
            <a-tab-pane key="2" tab="最近收藏">
              暂无收藏
            </a-tab-pane>
            <a-tab-pane key="3" tab="评论">
              暂无评论
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </div>
</template>

<script>
    export default {
      name: "list-component",
      data () {
        return {
          searchMode: false,
          searchText: '',
          isEditMode: false,
          userInfo: {},
          listInfo: {}
        }
      },
      mounted() {
        this.initListInfo();
      },
      methods: {
        initListInfo() {
          this.listInfo = {
            listName: '新建歌单',
            listImageSrc: '',
            songs: []
          }
        },
        toggleSearch(e) {
          this.searchMode = e;
          this.searchText = '';
        }
      }
    }
</script>

<style lang="scss" scoped>
  .music-list{
    width: $max;
    height: $max;
    overflow: auto;
    .music-list-header{
      height: 165px;
      width: $max;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      .music-list-img-box{
        width: 165px;
        height: $max;
        border-radius: 20px;
        background-color: $blue;
        color: $white;
        font-size: 96px;
        >i{
          margin-left: 32px;
        }
      }
      .list-infos-box{
        margin-left: 20px;
        height: $max;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-between;
        .list-name{
          font-size: 0.2rem;
          color: $black;
          font-weight: bold;
        }
        .user-infos-box{

        }
        .btn-area{
          :not(:first-child){
            margin-left: 10px;
          }
          display: flex;
          flex-direction: row;
          align-items: center;
          /deep/ .ant-input-affix-wrapper{
            border: none;
            width: 150px;
            border-radius: 20px;
            background-color: $gray;
            .ant-input{
              border: none;
              border-radius: 20px;
              width: 150px;
              background-color: $gray;
              :focus{
                box-shadow: none;
              }
            }
          }
          /deep/ .ant-btn:first-child{
            background-color: $blue;
            color: $white;
          }
          /deep/ .ant-btn{
            border: none;
            width: 110px;
            border-radius: 20px;
            background-color: $gray;
          }
          /deep/ .ant-btn:first-child:hover{
            background-color: $deepBlue;
          }
          /deep/ .ant-btn:hover{
            color: unset;
            background-color: #aaaaaa;
          }
        }
      }
    }
  }
</style>
