<template>
      <div class="search-modal-content" @mousedown.prevent=""><!--prevent阻止默认关闭modal的行为-->
          <div class="hot-search">
            <div class="search-title">
              <span>热门搜索</span>
            </div>
            <div class="search-list-box">
              <a-spin :spinning="isLoading">
              <ul class="search-list">
                <li class="search-list-item" @click="searchByClick(item.searchWord)" v-for="item in searchList" :title="item.content">
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
            <span class="search-clear">清空</span>
          </div>
          <div class="search-list-box">
            <ul class="search-list">
              <li class="search-list-item" @click="searchByClick(item.searchWord)" v-for="item in historyList" :title="item.content">
                <span class="search-word">{{item.searchWord}}</span>
                <span>
<!--                  placeholder-->
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
</template>

<script>
    import {debounceTime} from "rxjs/operators";
    import {Subject} from "rxjs";
    import {searchService} from "./service/search.service";

    export default {
      name: "search-modal",
      data() {
          return {
            searchList: [],
            historyList: [{searchWord: 2121}],
            isLoading: false,
            subscription$: [],
            searchSubject$: new Subject()
          }
      },
      mounted() {
        this.getHotMusicList('detail');
        const sub = this.searchSubject$.asObservable().pipe(debounceTime(500)).subscribe(() => {
          this.getSearchAdvice();
        });
        this.subscription$.push(sub);
      },
      methods:{
        getSearchAdvice() {

        },
        searchValueChange() {
          this.searchSubject$.next();
        },
        searchByClick(value) {
          this.$emit('searchValueChangeByClick', value);
          this.search(value);
        },
        search(value) {
          searchService.getSearchByKeywords(value).subscribe(res => {
            console.log(res);

          }, error => {
            console.log(error);
            this.$message.error('网络错误');
          })
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
      }
    }
</script>

<style scoped lang="scss">
  .search-modal-content{
    @include flex(row, space-between, flex-start);
    position: absolute;
    top: 40px;
    width: 600px;
    padding: 2px 14px;
    height: 450px;
    color: black;
    background-color: white;
    border-radius: 5px;
    z-index: $z1e4;
    box-shadow: 0 0 10px 0 rgb(10,10,10);
    .hot-search,.search-history{
      width: 50%;
      height: $max;
      @include flex(column, space-between, flex-start);
      .search-title{
        @include flex(row, space-between, center);
        height: 10%;
        width: $max;
        padding: 0 16px;
        font-size: 16px;
        .search-clear{
          color: #808080;
          font-size: 12px;
          cursor: pointer;
        }
      }
    }
    .search-list-box{
      padding: 12px 0;
      height: 90%;
      width: $max;
      /deep/ .ant-spin-nested-loading{
        height: $max;
        .ant-spin-container{
          height: $max;
        }
      }
      /deep/ .search-list{
        height: $max;
        @include flex(column, space-between, center);
        .search-list-item{
          @include flex(row, space-between, center);
          width: $max;
          height: 2.2em;
          padding: 0 16px;
          .search-word{
            max-width: 80%;
          }
        }
        .search-list-item:hover{
          cursor: pointer;
          background-color: #E6F7FF;
        }
      }
    }
    .hot-search .search-title{
      border-bottom: $grayBorder;
      border-right: $grayBorder;
    }
    .search-history .search-list-box{
      border-top: $grayBorder;
      border-left: $grayBorder;
    }
  }
</style>
