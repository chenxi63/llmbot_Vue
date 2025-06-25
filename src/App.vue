<template>
  <div id="app">
    <!-- 仅保留router-view作为路由出口，不包含任何布局 -->
    <router-view/> 
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}

html, body {
  margin: 0;
  padding: 0;
}

</style>