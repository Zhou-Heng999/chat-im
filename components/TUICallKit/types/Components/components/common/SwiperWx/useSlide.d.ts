import { Direction } from '.';
export default function useSlide({ pageCount }: {
    pageCount: any;
}): {
    currentIndex: import("@vue/composition-api").Ref<number>;
    direction: import("@vue/composition-api").Ref<Direction>;
    handleTouchStart: (event: any) => void;
    handleTouchEnd: (event: any) => void;
};
