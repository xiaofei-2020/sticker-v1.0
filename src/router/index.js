import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/maker",
    name: "maker",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "Maker" */ "../views/Maker.vue"),
  },
  {
    path: "/pic",
    name: "pic",
    component: () => import(/* webpackChunkName: "Pic" */ "../views/Pic.vue"),
  },
  {
    path: "/search",
    name: "search",
    component: () =>
      import(/* webpackChunkName: "Search" */ "../views/Search.vue"),
  },
  {
    path: "/gen-gif",
    name: "gen-gif",
    component: () =>
      import(/* webpackChunkName: "GenGif" */ "../views/GenGif.vue"),
  },
  {
    path: "/gen-img",
    name: "gen-img",
    component: () =>
      import(/* webpackChunkName: "gen-img" */ "../views/GenImg"),
  },
  {
    path: "/collection",
    name: "collection",
    component: () =>
      import(/* webpackChunkName: "Collection" */ "../views/Collection"),
  },

  {
    // 放最后
    path: "*",
    name: "not-found",
    component: () =>
      import(/* webpackChunkName: "NotFound" */ "../views/NotFound"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
