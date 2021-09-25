<template>
  <a-spin ref="musicianList" class="musician-list-content" :spinning="loading" @scroll="scrollToGetData">
    <div class="header-nav">
      <a-button :type="param.area === item.data ? 'primary': ''" shape="round"
                @click="changeSelectedType(item.data, 'area')" v-for="item in category.areaEnum">{{item.type}}
      </a-button>
    </div>
    <div class="header-nav-wrapper">
      <div class="header-nav">
        <a-button :type="param.type === item.data ? 'primary': ''" shape="round"
                  @click="changeSelectedType(item.data, 'type')" v-for="item in category.singerTypeEnum">
          {{item.type}}
        </a-button>
      </div>
      <div class="category-filter">
        <a-select style="width: 0.5rem" :default-value="category.initialsList[0].data" @change="changeSelectedType($event, 'initial')">
          <a-select-option v-for="(item,i) in category.initialsList" :value="item.data" :key="i">
            {{item.type}}
          </a-select-option>
        </a-select>
      </div>
    </div>
    <div class="top-10-singers">
      <div class="favorite-list-box" >
        <div class="box-wrapper" v-for="(item, index) in singers.filter((item, index) => index < 10)">
          <songs-item
            :item="item"
            :index="index"
            :type="'singer'"
            :showSingerName="false"
            :showPlayCount="false"
            :show-creator-name="false"
            :show-delete-icon="false"
            :showListName="true"
            :selectedIndex="selectedIndex"
            @playlistsHandle="gotoSingerInfo($event, item)"
            @selectedIndexHandle="selectedIndex = $event"
          ></songs-item>
        </div>
      </div>
    </div>
    <div class="rest-singers">
      <div class="rest-singer-name" v-for="(item, index) in singers.filter((item, index) => index >= 10)" @click="gotoSingerInfo('singer', item)">{{item.name}}</div>
    </div>
    <a-back-top :target="backTop"/>
  </a-spin>
</template>

<script>
  import {mainPageService} from "./service/main-page.service";
  import {debounceTime} from "rxjs/operators";
  import {Subject} from "rxjs";
  import songsItem from './songs-item';
  import {bully} from "./service/bully";
  import {SYSTEM_EVENTS} from "../Const";
  export default {
    name: "musician-list",
    components: {
      songsItem
    },
    data() {
      return {
        loading: false,
        category: {
          areaEnum: mainPageService.areaEnum,
          singerTypeEnum: mainPageService.singerTypeEnum,
          initialsList: mainPageService.initialsList
        },
        selectedIndex: -1,
        scroll$: new Subject(),
        hasMore: false,
        param: {
          limit: 30,
          offset: 0,
          initial: '-1',
          area: '-1',
          type: '-1'
        },
        singers: [],
        subscription: []
      }
    },
    created() {
      this.initData();
      this.getSingers();
    },
    destroyed() {
      for (const ite of this.subscription) {
        if (ite) {
          ite.unsubscribe();
        }
      }
      this.subscription = null;
    },
    mounted() {
      const sub = this.scroll$.asObservable().pipe(debounceTime(500)).subscribe(e => {
        if (e && e.target) {
          if (e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop <= 10) {
            if (this.hasMore) {
              this.param.offset +=  this.param.limit;
              this.getSingers();
            } else {
              this.$message.warning('已经到底了');
            }
          }
        }
      });
      this.subscription.push(sub);
    },
    methods: {
      gotoSingerInfo(e, data) {
        if (e === 'singer') {
          mainPageService.getSingerDetail(data.id).subscribe(res => {
            if (res && res.code === 200) {
              console.log(res, 'singer info');
              bully.setRMessage({
                type: SYSTEM_EVENTS.MULTI_PURPOSE_HANDLE,
                data: {
                  ...data,
                  ...res.data,
                  type: e
                }
              });
              this.$router.push({name : 'list-view'});
            }
          });
        }
      },
      initData() {
        this.singers = [];
        this.param = {
          limit: 30,
          offset: 0,
          initial: '-1',
          area: '-1',
          type: '-1'
        };
      },
      backTop() {
        return document.getElementsByClassName('musician-list-content')[0];
      },
      changeSelectedType(e, type) {
        this.param[type] = e;
        this.getSingers(true);
      },
      getSingers(clearCache = false) {
        mainPageService.getSingers(this.param).subscribe(res => {
          console.log(res);
          if (res && res.code && res.code === 200) {
            if (clearCache) {
              this.singers = [];
              this.param = {
                ...this.param,
                offset: 0
              };
            }
            this.singers.push(...res.artists);
            this.hasMore = res.more;
          }
        });
      },
      scrollToGetData(e) {
        this.scroll$.next(e);
      }
    }
  }
</script>

<style scoped lang="scss">
  .musician-list-content {
    padding: 0.05rem 0.25rem;
    width: 100%;
    height: 100%;
    overflow: auto;

    /deep/ .ant-back-top {
      right: 25px;
      bottom: 75px;
    }

    .header-nav {
      height: 0.3rem;
      line-height: 0.3rem;

      /deep/ .ant-btn {
        width: 80px;
        margin: 0 20px;
      }

      /deep/ .ant-btn-primary {
        background-color: $blue;
        border: $blue;

        &:hover {
          background-color: $deepBlue;
          border-color: $deepBlue;
        }
      }
    }
    .header-nav-wrapper{
      width: 96%;
      @include flex(row, space-between, center);
    }
      .favorite-list-box{
        width: 98%;
        @include flex(row, flex-start, center);
        flex-wrap: wrap;
        .box-wrapper{
          width: 1.8rem!important;
          height: 1.6rem;
          @include flex(row, center, center);
        }
      }
    .top-10-singers{
      width: 100%;
      margin-top: 20px;
      padding-left: 20px;
      @include flex(row, center, center);
    }
    .rest-singers{
      width: 100%;
      margin-top: 20px;
      padding-left: 20px;
      @include flex(row, space-between, center);
      flex-wrap: wrap;
      .rest-singer-name {
        width: 20%;
        text-align: center;
        line-height: 5em;
        &:hover{
          color: $blue;
          cursor: pointer;
        }
      }
    }
  }
</style>
