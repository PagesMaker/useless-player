<template>
  <a-spin :spinning="loading">
    <div class="rank-listing-content">

    </div>
  </a-spin>
</template>

<script>
    export default {
      name: "rank-list",
      data() {
        return {
          loading: false
        }
      },
      mounted() {
        setTimeout(() => {
          this.loading = false;
          this.$refs.carousel.next();
        }, 1500);
      },
      methods() {

      }
    }
</script>

<style scoped lang="scss">

</style>
