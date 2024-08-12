// @ts-nocheck
// export * from '@/uni_modules/lime-vue'

// #ifdef VUE3
export * from 'vue';
// #endif
// #ifndef VUE3
export * from '@vue/composition-api';
// #endif
// #ifdef APP-NVUE
import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'
Vue.use(VueCompositionAPI)
// #endif