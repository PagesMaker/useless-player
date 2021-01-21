<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
	name: 'App'
}
</script>

<style lang="scss">
  * {
    padding: 0;
    list-style: none;
  }
  #app{
    font-size: unset;
    width: 100%;
    height: 100%
  }
  .blue-bg{
    background-color: $blue;
  }
  .anticon{
    cursor: pointer;
  }
  .router-content{
    height: 100%;
    width: 100%;
    padding: 30px;
  }



</style>
