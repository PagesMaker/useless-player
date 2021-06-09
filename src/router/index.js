import Vue from 'vue'
import Router from 'vue-router'
// import mainContent from '@/components/main-content'
import App from '@/App'
// import listComponent from '@/components/list-component'
// import mainPageComponent from '@/components/main-page'
import {SERVER} from '../components/service/app.service';
const originalPush = Router.prototype.push

Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
Vue.use(Router)

export default new Router({
  mode: SERVER ? '' : 'history',
	routes: [
    {
      path: '*',
      redirect: '/list-view'
    },
    {
      path: '/',
      redirect: '/list-view'
    },
		{
			path: '',
			name: 'app',
			component: App,
			children: [
				{
					path: '',
					name: 'main-content',
					component: resolve =>  require(['../components/main-content'], resolve),
          children: [
            {
              path: '/list-view',
              name: 'list-view',
              component: resolve => require(['../components/list-component'], resolve),
              meta: { keepAlive:true }
            },
            {
              path: '/main-page',
              name: 'main-page',
              component: resolve => require(['../components/main-page'], resolve),
              meta: { keepAlive:true }
            }
          ]
				}
			]
		}
	]
})
