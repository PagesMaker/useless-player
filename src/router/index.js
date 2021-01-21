import Vue from 'vue'
import Router from 'vue-router'
import mainContent from '@/components/main-content'
import App from '@/App'
import listComponent from '@/components/list-component'
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
					component: mainContent,
          children: [
            {
              path: '/',
              name: 'list-view',
              component: listComponent
            }
          ]
				}
			]
		}
	]
})
