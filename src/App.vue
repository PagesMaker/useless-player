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
  $white: #F6F6F6;
  * {
    padding: 0;
    list-style: none;
    background-color: $white;
  }
  #app{
    width: 100%;
    height: 100%
  }

</style>
