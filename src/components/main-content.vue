<template>
    <div class="main-content">
       <div class="left-menu">
         <left-menu></left-menu>
       </div>
       <div class="right-content">
         <right-content></right-content>
       </div>
    </div>
</template>

<script>
import leftMenu from './left-menu';
import rightContent from './right-content';
export default {
	name: "main-content",
	components: {
		leftMenu, rightContent
	}
}
</script>

<style lang="scss" scoped>
  .main-content{
    width: $max;
    height: $max;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    background: $white;
    .left-menu{
      width: 12%;
      height: $max;
    }
    .right-content{
      background: white;
      width: 88%;
      height: $max;
    }
  }
</style>
