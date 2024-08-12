import Vue from 'vue';
// @ts-ignore
import PermitTipComp from './PermitTip.vue';

const PermitTip: any = {};
let instance: any = null;
let seed = 1;

export const createToast = () => {
  const appendTo = document.body;
  if (instance) {
    appendTo.removeChild(instance.$el);
    instance.$destroy();
  }

  // @ts-ignore
  const PermitTipCompConstructor= Vue.extend(PermitTipComp);
  const permitTipInstance = new PermitTipCompConstructor({
    propsData: {
      index: `toast-item-${seed++}`,
      destroy() {
        appendTo.removeChild(permitTipInstance.$el);
        permitTipInstance.$destroy();
      }
    }
  });
  
  permitTipInstance.$mount();
  appendTo.appendChild(permitTipInstance.$el);
  instance = permitTipInstance;
};

PermitTip.show = () => createToast();

export {
  PermitTip,
};
