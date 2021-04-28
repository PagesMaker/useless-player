<template>
    <div class="outside-mask" @click="closeContextMenu()" @contextmenu="closeContextMenu()">
      <div class="context-menu" :style="{'left' : position.left + 'px', 'top': position.top + 'px'}">
        <ul class="context-menu-listing">
          <li class="context-menu-item" @click.stop="">
            1
          </li>
        </ul>
      </div>
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
        }
      },
      props: ['position']
    }
</script>

<style scoped lang="scss">
  .context-menu{
    background-color: #fff;
    border-radius: 3px;
    box-shadow: $shadow;
    @include flex(column, flex-start, flex-start);
    width: 280px;
    font-size: 16px;
    color: black;
    padding:  20px 0;
    position: fixed;
    height: 2.6em;
    span{
      margin-left: 24px;
    }
    /deep/ .anticon{
      color: black;
    }
  }
  .context-menu:hover{
    cursor: pointer;
    background-color: #E7E7E7;
  }
    .context-menu-listing{
      @include flex(column, flex-start, flex-start);
      margin-bottom: unset;
      width: 100%;
      .context-menu-item{
        @include flex(row, flex-start, center);
        padding: 0 0 0 63px;
        width: 100%;
        height: 2.6em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow:ellipsis;
      }
      .context-menu-item:hover{
        cursor: pointer;
        background-color: #E7E7E7;
      }
  }
  .outside-mask{
    width: 100%;
    z-index: 9999999;
    height: 100%;
    position: fixed;
    background-color: unset;
    left: 0;
    top: 0;
  }
</style>
