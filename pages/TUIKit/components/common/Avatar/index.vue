<template>
  <div
    class="avatar-container"
   
  >
  <!--  :style="{
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarBorderRadius,
    }" -->
    <template v-if="isUniFrameWork">
      <image
        v-if="!loadErrorInUniapp"
        class="avatar-image"
        :src="avatarImageUrl || defaultAvatarUrl"
        @load="avatarLoadSuccess"
        @error="avatarLoadFailed"
      ></image>
      <image
        v-else
        class="avatar-image"
        :src="defaultAvatarUrl"
        @load="avatarLoadSuccess"
        @error="avatarLoadFailed"
      ></image>
    </template>
    <image
      v-else
      class="avatar-image"
      :src="avatarImageUrl || defaultAvatarUrl"
      @load="avatarLoadSuccess"
      @error="avatarLoadFailed"
    />
    <div
      v-if="useAvatarSkeletonAnimation"
      :class="{
        placeholder: true,
        hidden: isImgLoaded,
        'skeleton-animation': useAvatarSkeletonAnimation
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs } from '../../../adapter-vue';
import { isUniFrameWork } from '../../../utils/env';

interface IProps {
  url: string;
  size?: string;
  borderRadius?: string;
  useSkeletonAnimation?: boolean;
}

interface IEmits {
  (key: 'onLoad', e: Event): void;
  (key: 'onError', e: Event): void;
}

const defaultAvatarUrl = "https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png";
const emits = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  // uniapp vue2 不支持在defineProps中使用常量
  url: "https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png",
  size: "36px",
  borderRadius: "5px",
  useSkeletonAnimation: false,
});

const {
  size: avatarSize,
  url: avatarImageUrl,
  borderRadius: avatarBorderRadius,
  useSkeletonAnimation: useAvatarSkeletonAnimation,
} = toRefs(props);

const isImgLoaded = ref<boolean>(false);
const loadErrorInUniapp = ref<boolean>(false);

function avatarLoadSuccess(e: Event) {
  isImgLoaded.value = true;
  emits('onLoad', e);
}

function avatarLoadFailed(e: Event) {
  if (isUniFrameWork) {
    loadErrorInUniapp.value = true;
  } else {
    (e.currentTarget as HTMLImageElement).src = defaultAvatarUrl;
  }
  emits('onError', e);
}
</script>

<style scoped lang="scss">
:not(not) {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
}

.avatar-container {
  position: relative;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  flex: 0 0 auto;
	height: 80rpx;
	width: 80rpx;
	border-radius: 50%;
  .placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #ececec;
    transition:
      opacity 0.3s,
      background-color 0.1s ease-out;

    &.skeleton-animation {
      animation: breath 2s linear 0.3s infinite;
    }

    &.hidden {
      opacity: 0;
    }
  }

  .avatar-image {
    width: 100%;
    height: 100%;
  }
}

@keyframes breath {
  50% {
    /* stylelint-disable-next-line scss/no-global-function-names */
    background-color: darken(#ececec, 10%);
  }
}
</style>
