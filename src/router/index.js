import Vue from 'vue'
import Router from 'vue-router'
import mainContent from '@/components/main-content'
import App from '@/App'
Vue.use(Router)

export default new Router({
	routes: [
		{
			path: '/',
			name: 'app',
			component: App,
			children: [
				{
					path: '',
					name: 'main',
					component: mainContent
				}
			]
		}
	]
})
