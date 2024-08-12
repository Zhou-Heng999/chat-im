import Vue from 'vue';
import MessageComponent from './index.vue';

const MessageConstructor = Vue.extend(MessageComponent)

let hasToast = false
let message = null

export default function Message(options) {
  const { type = 'default', ...otherOptions } = options

  if (!hasToast) {
    message = new MessageConstructor().$mount()
    document.querySelector('.uni-body').appendChild(message.$el)
    hasToast = true
  }

  message[type](otherOptions)
}