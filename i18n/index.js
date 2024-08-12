import VueI18n from 'vue-i18n'
import Vue from 'vue'
// import en from './en'
// import zh from './zh'
import lan from './lan.json'
import emoji from './emoji.json'
// import { useStore } from 'vuex'
// const { state } = useStore()
Vue.use(VueI18n)
let Language = { ...lan.Language, ...emoji.Language }
let zh = {},
  en = {},
  zh_tw={},
  hin={},
  esp={},
  pt={},
  vi={}
for (let i in Language) {
  zh_tw[i] = Language[i]['name_zh_tw']
  en[i] = Language[i]['name_en']
  zh[i] = Language[i]['name_zh']
  hin[i] = Language[i]['name_hin']
  esp[i] = Language[i]['name_esp']
  pt[i] = Language[i]['name_pt']
  vi[i] = Language[i]['name_vi']
}
const i18n = new VueI18n({
  locale:uni.getStorageSync('lan')||'zh',
  globalInjection: true,
  messages: {
    en,
    zh,
	zh_tw,
	hin,
	esp,
	pt,
	vi
  },
})

export default i18n
