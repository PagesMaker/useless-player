import router from './router';
import Vue from 'vue';
import 'ant-design-vue/dist/antd.css';
import Antd from 'ant-design-vue';
import App from './App';
import mainContent from './components/main-content';
import 'font-awesome/css/font-awesome.css';
import moment from "moment";
import axios from 'axios';
import VueAxios from 'vue-axios';
const config = require('../config');

Vue.use(Antd);
Vue.use(VueAxios, axios);
Vue.config.productionTip = false;
Vue.filter('timeFormat', function (value, format = '') {
  console.log(value,format);
  if (isNaN(value) || !(value instanceof Number)) {
    value = 0;
  }
  return moment(moment({minute: Math.floor(value / 60), second: value % 60})).format(format);
})

new Vue({
	el: '#app',
	router,
	components: { App, mainContent },
	template: '<App/>',
	render: h => h(App)
}).$mount('#app');
export const SERVER = location.href.includes('localhost') ? config.dev.server : '';
