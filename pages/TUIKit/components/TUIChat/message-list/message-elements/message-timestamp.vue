<template>
	<div class="message-timestamp" v-if="timestampShowFlag">
		<!-- <u-divider class="max-width" textSize='12' :text="timestampShowContent"></u-divider> -->
		<text class="time-box">{{timestampShowContent}}</text>
		<!-- {{  }}111 -->
	</div>
</template>
<script setup lang="ts">
	import { toRefs, ref, watch } from "../../../../adapter-vue";
	import { TUITranslateService } from "@tencentcloud/chat-uikit-engine";
	import { tc } from '@/utils/util'

	const props = defineProps({
		currTime: {
			type: Number,
			default: 0,
		},
		prevTime: {
			type: Number,
			default: 0,
		},
		nextTime: {
			type: Number,
			default: 0,
		}
	});
	const { currTime, prevTime, nextTime } = toRefs(props);
	const timestampShowFlag = ref(false);
	const timestampShowContent = ref("");

	const day = 86400

	const isRenderToday = ref(false)

	const handleItemTime = (currTime : number, prevTime : number, nextTime : number) => {
		// console.log('%c -----------', 'color: yellow')
		// console.log('currTime...', currTime)
		// console.log('prevTime...', prevTime)
		// console.log('nextTime...', nextTime)

		// 当前和上一条消息是否同一天
		let _isSameDay = isSameDay(currTime, prevTime)
		// 当前和下一条消息是否同一天
		let _isSameDay2 = isSameDay(currTime, nextTime)
		timestampShowFlag.value = false

		// 没有上一条和下一条，只有一条消息
		if (!prevTime && !nextTime) {
			timestampShowFlag.value = true
			return calculateTimestamp(currTime * 1000)
		}

		// 没上一条，有下一条，第一条消息
		if (!prevTime && nextTime) {
			if (!_isSameDay2) {
				timestampShowFlag.value = true
				return calculateTimestamp(currTime * 1000)
			}
		}

		// 有上一条，没下一条，最后一条消息
		if (prevTime && !nextTime) {
			// if (!_isSameDay) {
				timestampShowFlag.value = true
				return calculateTimestamp(currTime * 1000)
			// }
		}

		// 既有上一条也有下一条，中间消息
		if (prevTime && nextTime) {
			// 今天和上一条下一条不同
			if (!_isSameDay && !_isSameDay2) {
				timestampShowFlag.value = true
				return calculateTimestamp(currTime * 1000)
			}

			// 今天和上一条相同，和下一条不同
			if (_isSameDay && !_isSameDay2) {
				timestampShowFlag.value = true
				return calculateTimestamp(currTime * 1000)
			}
		}
	}

	// todo 原代码
	// const handleItemTime = (currTime: number, prevTime: number, nextTime: number) => {
	//   // todo 不知道为什么时间少了一天
	//   timestampShowFlag.value = false;

	//   if (currTime <= 0) {
	//     return '';
	//   } else if (!prevTime || prevTime <= 0) {
	//     // timestampShowFlag.value = true;
	// 	// currTime += day
	//     // return calculateTimestamp(currTime * 1000);
	// 	// return '第一条'
	//   } else {
	// 	currTime += day
	// 	prevTime += day
	//     const minDiffToShow = 60 * 60 * 24; //10min 10*60s
	//     const diff = currTime - prevTime; //s

	//     let _isSameDay = isSameDay(currTime, prevTime);

	//     if(!_isSameDay){
	//       timestampShowFlag.value = true;
	//       return calculateTimestamp(currTime * 1000);
	//     }


	//     // if (diff >= minDiffToShow) {
	//     //   timestampShowFlag.value = true;
	//     //   return calculateTimestamp(currTime * 1000);
	//     // }


	//     // const minDiffToShow = 10 * 60; //10min 10*60s
	//     // const diff = currTime - prevTime; //s
	//     // if (diff >= minDiffToShow) {
	//     //   timestampShowFlag.value = true;
	//     //   return calculateTimestamp(currTime * 1000);
	//     // }
	//   }
	//   return "";
	// };

	function isSameDay(timestamp1 : any, timestamp2 : any) {
		var date1 = new Date(timestamp1 * 1000); // JavaScript的Date对象使用的是毫秒，所以需要将秒乘1000
		var date2 = new Date(timestamp2 * 1000);

		return date1.getFullYear() === date2.getFullYear() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getDate() === date2.getDate();
	}


	watch(
		() => [currTime.value, prevTime.value, nextTime.value],
		(newVal : any, oldVal : any) => {
			if (newVal?.toString() === oldVal?.toString()) {
				return;
			} else {
				timestampShowContent.value = handleItemTime(
					currTime.value,
					prevTime.value,
					nextTime.value
				);
			}
		},
		{
			immediate: true,
		}
	);

	// 计算时间戳函数
	// calculate timestamp
	function calculateTimestamp(timestamp : number) : string {
		const todayZero = new Date().setHours(0, 0, 0, 0);
		const thisYear = new Date(
			new Date().getFullYear(),
			0,
			1,
			0,
			0,
			0,
			0
		).getTime();
		const target = new Date(timestamp);

		const oneDay = 24 * 60 * 60 * 1000;
		const oneWeek = 7 * oneDay;
		const oneYear = 365 * oneDay;

		const diff = todayZero - target.getTime();

		function formatNum(num : number) : string {
			return num < 10 ? "0" + num : num.toString();
		}

		const weekdays = [
			"星期日",
			"星期一",
			"星期二",
			"星期三",
			"星期四",
			"星期五",
			"星期六",
		];
		const weekday = weekdays[target.getDay()];
		return `${tc(TUITranslateService.t("time." + weekday))}, ${target.getMonth() + 1}/${target.getDate()}`;

		//  if (diff <= 0) {
		//    // today, only display hour:minute
		//    return `${formatNum(target.getHours())}:${formatNum(target.getMinutes())}`;
		//  } else if (diff <= oneDay) {
		//    // yesterday, display yesterday:hour:minute
		//    return `${tc(TUITranslateService.t("time.昨天"))} ${formatNum(
		//      target.getHours()
		//    )}:${formatNum(target.getMinutes())}`;
		//  } else if (diff <= oneWeek - oneDay) {
		//    // Within a week, display weekday hour:minute
		//    const weekdays = [
		//      "星期日",
		//      "星期一",
		//      "星期二",
		//      "星期三",
		//      "星期四",
		//      "星期五",
		//      "星期六",
		//    ];

		// const weekday = weekdays[target.getDay()];
		//    return `${tc(TUITranslateService.t("time." + weekday))} ${formatNum(
		//      target.getHours()
		//    )}:${formatNum(target.getMinutes())}`;
		//  } else if (target.getTime() >= thisYear) {
		//    // Over a week, within this year, display mouth/day hour:minute
		//    return `${target.getMonth() + 1}/${target.getDate()} ${formatNum(
		//      target.getHours()
		//    )}:${formatNum(target.getMinutes())}`;
		//  } else {
		//    // Not within this year, display year/mouth/day hour:minute
		//    return `${target.getFullYear()}/${
		//      target.getMonth() + 1
		//    }/${target.getDate()} ${formatNum(target.getHours())}:${formatNum(
		//      target.getMinutes()
		//    )}`;
		//  }
	}
</script>
<style lang="scss" scoped>
	@import "../../../../assets/styles/common.scss";

	.message-timestamp {
		width: 100%;
		margin: 0 auto;
		color: #adb5bd;
		font-size: 12px;
		width: -webkit-fill-available;
		overflow-wrap: anywhere;
		display: flex;
		justify-content: center;
		align-content: center;
		align-items: center;
		text-align: center;
		padding: 10rpx;
		position: relative;
	}

	.time-box {
		padding: 10rpx 20rpx;
		box-sizing: border-box;
		border-radius: 10rpx;
		background: #ebebeb;
		color: #adb5bd;
	}
</style>