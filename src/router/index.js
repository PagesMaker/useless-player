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
  // mode: SERVER ? 'hash' : 'history',
	routes: [
    {
      path: '*',
      redirect: {name: 'main-page'}
    },
    {
      path: '/',
      redirect: {name: 'main-page'}
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
            },
            {
              path: '/my-music',
              name: 'my-music',
              component: resolve => require(['../components/my-music'], resolve),
              children: [
                {
                  path: 'played-music-list',
                  name: 'played-music-list',
                  component: resolve => require(['../components/my-music'], resolve)
                },
               /* {
                  path: 'audition-list',
                  name: 'audition-list',
                  component: resolve => require(['../components/my-music'], resolve)
                },*/
                {
                  path: 'my-favorite',
                  name: 'my-favorite',
                  component: resolve => require(['../components/my-music'], resolve)
                }
              ]
            }
          ]
				}
			]
		}
	]
})
