import store from "@/store/index.js"
import { ListMixin } from '@/mixin/list';

function getContent(msg: any) {
  if(!msg?.cloudCustomData)return ''
  let t=''
  try{
    t=JSON.parse(msg?.cloudCustomData)
  }catch(e){
    t=''
    //TODO handle the exception
  }
  if(t){
    t.txt = ListMixin.methods.maskSensitiveInfo(t.txt,store.state.sensitiveData)
  }
  return t || ''
}

export default getContent