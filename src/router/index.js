import Vue from 'vue'
import Router from 'vue-router'
import mainContent from '@/components/main-content'
import App from '@/App'
import listComponent from '@/components/list-component'
import mainPageComponent from '@/components/main-page'
const originalPush = Router.prototype.push

Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
Vue.use(Router)

export default new Router({
	routes: [
		{
			path: '',
			name: 'app',
			component: App,
			children: [
				{
					path: '',
					name: 'main-content',
					component: mainContent,
          children: [
            {
              path: '/',
              name: 'list-view',
              component: listComponent,
              meta: { keepAlive:true }
            },
            {
              path: '/main-page',
              name: 'main-page',
              component: mainPageComponent
            }
          ]
				}
			]
		},
    { path: '*', redirect: '/' }
	]
})
