<template>
      <div class="search-modal-content" @mousedown.prevent=""><!--prevent阻止默认关闭modal的行为-->
      </div>
</template>

<script>
    export default {
      name: "search-modal",
      data() {
          return {

          }
      },
      mounted() {

      },
      methods:{
      },
      props: ['searchValue']
    }
</script>

<style scoped lang="scss">
  .search-modal-content{
    @include flex(row, space-between, flex-start);
    position: absolute;
    top: 40px;
    width: 600px;
    height: 450px;
    background-color: white;
    border-radius: 5px;
    z-index: 10000;
    box-shadow: 0 0 10px 0 rgb(10,10,10);
  }
</style>
