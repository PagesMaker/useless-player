<template>
  <div class="search-modal-content" @mousedown.prevent=""><!--prevent阻止默认关闭modal的行为-->
    <div class="search-wrapper" v-if="searchValue.length === 0">
      <div class="hot-search">
        <div class="search-title">
          <span>热门搜索</span>
        </div>
        <div class="search-list-box">
          <a-spin :spinning="isLoading">
            <ul class="search-list">
              <li class="search-list-item" @click="searchByClick(item.searchWord)" v-for="item in searchList"
                  :title="item.content">
                <span class="search-word">{{item.searchWord}}</span>
                <span class="search-times">{{item.score | tenThousands()}}</span>
              </li>
            </ul>
          </a-spin>
        </div>
      </div>
      <div class="search-history">
        <div class="search-title">
          <span>搜索历史</span>
          <span class="search-clear" @click="clearSearchHistory()">清空</span>
        </div>
        <div class="search-list-box">
          <ul class="search-list">
            <li class="search-list-item" @click="searchByClick(item)" v-for="item in historyList"
                :title="item">
              <span class="search-word">{{item}}</span>
              <span>
<!--                  placeholder-->
                </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="search-wrapper" v-else>
      <div class="online-music">
        <div class="search-header"><span>在线音乐</span></div>
        <div class="search-advice-listing">
          <div class="search-advice-content" v-if="searchAdviceListOrder.length">
            <div class="sa-menu" v-for="(item, idx) in searchAdviceListOrder">
              <div class="sa-left">
                <span v-if="item === 'songs'">单曲</span>
                <span v-if="item === 'artists'">歌手</span>
                <span v-if="item === 'albums'">专辑</span>
                <span v-if="item === 'playlists'">歌单</span>
              </div>
              <div class="sa-right">
                <ul class="sa-listing">
                  <li class="sa-list-items" :title="subItem.description || subItem.name" @click="searchByClick(getSearchData(subItem, searchAdviceListOrder[idx]), searchAdviceListOrder[idx])" v-for="subItem in searchAdviceList[idx][item]">
                    <div v-if="item === 'albums' || item === 'playlists' || item === 'artists'" class="img-box">
                      <img :src="subItem.imageUrl" alt="" draggable="false">
                    </div>
                    <span v-for="font in subItem.splitedName"
                          v-if="item === 'songs' || item === 'albums' || item === 'playlists'"
                          :style="{'color': searchValue.includes(font) ? 'red' : 'black'}"
                    >
                      {{font}}
                    </span>
                    <span v-if="item === 'songs' || item === 'albums'">&nbsp;-&nbsp;</span>
                    <span v-for="font in subItem.splitedSingerName"
                          v-if="item === 'songs' || item === 'albums' || item === 'artists'"
                          :style="{'color': searchValue.includes(font) ? 'red' : 'black'}"
                    >
                      {{font}}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <!--<div class="sa-artists" v-else-if="item === 'artists'">
              <div class="sa-left"><span>单曲</span></div>
            </div>
            <div class="sa-albums" v-else-if="item === 'albums'">

            </div>
            <div class="sa-playlists" v-else-if="item === 'playlists'">

            </div>-->
          </div>
          <div class="no-search-advice" v-if="searchAdviceList.length === 0 && !isSearching">
            <a-empty description="没有搜索到相关内容"></a-empty>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {debounceTime} from "rxjs/operators";
  import {Subject} from "rxjs";
  import {searchService} from "./service/search.service";
  import {SYSTEM_EVENTS} from "../Const";
  import {bully} from "./service/bully";
  import {UserInfos} from "./service/user-info.service";

  export default {
    name: "search-modal",
    data() {
      return {
        searchList: [],
        historyList: [],
        isSearching: false,
        isLoading: false,
        subscription$: [],
        searchAdviceList: [],
        searchAdviceListOrder: [],
        searchSubject$: new Subject(),
        clearedSearchValue: false
      }
    },
    mounted() {
      this.getHotMusicList('detail');
      const sub = this.searchSubject$.asObservable().pipe(debounceTime(500)).subscribe(() => {
        this.getSearchAdvice();
      });
      const sub2 = bully.getMessage().subscribe(res => {
        /*if (res.type === SYSTEM_EVENTS.SEARCH_KEYWORDS) {
          this.$emit('searchValueChangeByClick', this.searchValue);
        }*/
        // 暂时用不到
      })
      this.subscription$.push(sub, sub2);
      if (this.searchValue.length) {
        this.getSearchAdvice();
      }
      this.historyList = UserInfos.localData.searchHistory;
    },
    methods: {
      getSearchData(data, type) {
        if (type === 'artists') {
          return data.name
        }
        return data.splitedSingerName ? `${data.name} ${data.singerNameList}` : data.name
      },
      getSearchAdvice() {
        if (this.searchValue === '') {
          this.clearedSearchValue = true;
          return
        }
        this.clearedSearchValue = false;
        this.isSearching = true;
        searchService.getSearchAdvice(this.searchValue).subscribe(res => {
          console.log(res);
          this.isSearching = false;
          this.searchAdviceList = [];
          this.searchAdviceListOrder = [];
          if (res.code === 200) {
            const data = res.result;
            if (Object.keys(data).length === 0) {
              return;
            }
            data.order.forEach((item, index) => {
              data[item].forEach(sub => {
                if (item === 'songs') {
                  sub.name && (sub.splitedName = sub.name.split(''));
                  sub.singerNameList = '';
                  sub.artists.map(item => sub.singerNameList += item.name + (sub.artists.indexOf(item) === sub.artists.length - 1 ? '' : '/ '));
                  sub.splitedSingerName = sub.singerNameList.split('');
                } else if (item === 'artists') {
                  sub.name && (sub.splitedSingerName = sub.name.split(''));
                  sub.imageUrl = sub.picUrl || sub.img1v1Url;
                } else if (item === 'playlists') {
                  sub.name && (sub.splitedName = sub.name.split(''));
                  sub.imageUrl = sub.coverImgUrl;
                } else if (item === 'albums') {
                  sub.name && (sub.splitedName = sub.name.split(''));
                  sub.singerNameList = sub.artist.name;
                  sub.splitedSingerName = sub.singerNameList.split('');
                  sub.imageUrl = sub.artist.picUrl || sub.artist.img1v1Url;
                }
              });
              this.searchAdviceList[index] = {};
              this.searchAdviceList[index][item] = data[item];
            });
            this.searchAdviceListOrder = data.order;
          }
        }, error => {
          this.isSearching = false;
        });
      },
      searchByClick(value, data) {
        console.log(searchService.searchEnum[data]);
        this.$emit('searchValueChangeByClick', {
          data: value,
          type: searchService.searchEnum[data]
        });
        if (!UserInfos.localData.searchHistory.includes(value)) {
          UserInfos.localData.searchHistory.push(value);
          if (UserInfos.localData.searchHistory.length >= 10) {
            UserInfos.localData.searchHistory.shift();
          }
          this.historyList = UserInfos.localData.searchHistory;
        }
      },
      clearSearchHistory() {
        this.historyList = UserInfos.localData.searchHistory = [];
      },
      getHotMusicList(type) {
        this.isLoading = true;
        // type: simple | detail
        let searchBy = '';
        if (type === 'detail') {
          searchBy += '/' + type;
        }
        searchService.getHotSearchList(searchBy).subscribe(res => {
          console.log(res);
          this.isLoading = false;
          if (res.code === 200) {
            this.searchList = res.data || [];
            this.searchList.length >= 10 && (this.searchList.length = 10);
            console.log(this.searchList);
          }
        }, error => {
          console.log(error);
          this.isLoading = false;
          this.$message.error('获取热搜列表失败');
        })
      }
    },
    props: ['searchValue'],
    destroyed() {
      this.subscription$.forEach(item => {
        item.unsubscribe();
      });
    },
    watch: {
      searchValue: {
        handler() {
          this.searchSubject$.next();
          if (this.clearedSearchValue) {
            this.searchAdviceList = [];
            this.searchAdviceListOrder = [];
          }
        }
      }
    },
    computed: {
    }
  }
</script>

<style scoped lang="scss">
  .search-modal-content {
    width: 100%;
    height: 100%;
    position: absolute;
    .search-wrapper {
      @include flex(row, space-between, flex-start);
      position: absolute;
      top: 40px;
      width: 600px;
      padding: 10px 14px;
      height: auto;
      max-height: 1000px;
      color: black;
      background-color: white;
      border-radius: 5px;
      z-index: $z1e4;
      box-shadow: 0 0 10px 0 rgb(10, 10, 10);
      ul{
        margin: 0;
      }
      .hot-search, .search-history {
        width: 50%;
        height: $max;
        @include flex(column, space-between, flex-start);

        .search-title {
          @include flex(row, space-between, center);
          height: 10%;
          width: $max;
          padding: 0 16px 10px 16px;
          font-size: 16px;

          .search-clear {
            color: #808080;
            font-size: 12px;
            cursor: pointer;
          }
        }
      }

      .search-list-box {
        padding: 12px 0;
        height: 90%;
        width: $max;

        /deep/ .ant-spin-nested-loading {
          height: $max;

          .ant-spin-container {
            height: $max;
          }
        }

        /deep/ .search-list {
          height: $max;
          @include flex(column, space-between, center);

          .search-list-item {
            @include flex(row, space-between, center);
            width: $max;
            height: 2.2em;
            padding: 0 16px;

            .search-word {
              max-width: 80%;
              white-space: nowrap;
              overflow: hidden;
            }
          }

          .search-list-item:hover {
            cursor: pointer;
            background-color: #E6F7FF;
          }
        }
      }

      .hot-search .search-title {
        border-bottom: $grayBorder;
        border-right: $grayBorder;
      }

      .search-history .search-list-box {
        border-top: $grayBorder;
        border-left: $grayBorder;
      }

      .online-music{
        width: 100%;
        font-size: 16px;
        img{
          width: 30px;
          height: 30px;
        }
        .search-header{
          padding: 0 0 10px 0;
          border-bottom: 1px solid #EEEEEE;
        }
        .search-advice-listing {
          width: 100%;
          @include flex(row, center, center);
          padding: 0 18px;
          font-size: 14px;
          .search-advice-content{
            width: 100%;
            @include flex(column, flex-start, center);
            .sa-menu{
              width: 100%;
              @include flex(row, flex-start, flex-start);
              .sa-left{
                padding: 11px 14px 0 0;
                white-space: nowrap;
              }
              .sa-right{
                width: 100%;
                .sa-listing{
                  @include flex(column, flex-start, flex-start);
                  .sa-list-items{
                    width: 100%;
                    @include flex(row, flex-start, center);
                    padding: 7px 0;
                    white-space: nowrap;
                    .img-box{
                      padding-right: 4px;
                      img{
                        border-radius: 30px;
                      }
                    }
                  }
                  .sa-list-items:hover{
                    background-color: #E6F7FF;
                    cursor: pointer;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
</style>
