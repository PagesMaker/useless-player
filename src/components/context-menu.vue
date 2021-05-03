<template>
        <div class="context-menu" :style="{'left' : position.left + 'px', 'top': position.top + 'px'}">
          <ul class="context-menu-listing">
            <li v-for="item in contextMenu" class="context-menu-item" @click.stop="menuClick(item)" @contextmenu.stop.prevent="menuClick(item)">
              {{item.name}}
            </li>
          </ul>
        </div>
</template>

<script>
    export default {
      name: "context-menu",
      data() {
        return {

        }
      },
      mounted() {
        console.log(this.position);
      },
      methods: {
        closeContextMenu() {
          this.$emit('close');
        },
        menuClick(item) {
          this.$emit('action', item.action);
        }
      },
      props: ['position', 'contextMenu', 'contextMenuIdx']
    }
</script>

<style scoped lang="scss">
  .context-menu{
    z-index: 9999999;
    background-color: #fff;
    border-radius: 3px;
    box-shadow: $shadow;
    @include flex(column, flex-start, flex-start);
    width: 140px;
    font-size: 16px;
    color: black;
    padding:  5px 0;
    position: fixed;
    height: auto;
    span{
      margin-left: 24px;
    }
    /deep/ .anticon{
      color: black;
    }
  }
    .context-menu-listing{
      @include flex(column, flex-start, flex-start);
      margin-bottom: unset;
      width: 100%;
      .context-menu-item{
        @include flex(row, flex-start, center);
        padding: 0 0 0 20px;
        width: 100%;
        height: 2em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow:ellipsis;
      }
      .context-menu-item:hover{
        cursor: pointer;
        background-color: #E7E7E7;
      }
  }
</style>
