import { onMounted, ref, watch } from "../../../../adapter-vue";

export function useSwiperSliders(props: any) {
  const sliders = ref<Element[]>([]);
  const updateSliders = () => {
    const renderUserIds = props.renderStreamList.map(item => item.userId);

    sliders.value = props.slider.filter((item) => renderUserIds.includes(item.userId));
  };

  onMounted(() => {
    sliders.value = props.slider;
  });

  watch(() => props.renderStreamList, () => {
    updateSliders();
  }, {
    immediate: true,
  })

  // @ts-ignore
  return sliders;
}