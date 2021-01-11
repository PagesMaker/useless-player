import router from './router'
import Vue from 'vue';
import 'ant-design-vue/dist/antd.css';
import Antd from 'ant-design-vue';
import App from './App';
import mainContent from './components/main-content';
import login from "./components/login";

Vue.use(Antd);

Vue.config.productionTip = false;

new Vue({
	el: '#app',
	router,
	components: { App, mainContent, login },
	template: '<App/>',
	render: h => h(App)
}).$mount('#app');
