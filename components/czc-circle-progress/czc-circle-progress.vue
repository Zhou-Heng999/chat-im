<template>
	<view class="">
		<view class="box">
			<view class="circle" :style="[circle]">
				<view class="left" :style="[size]">
					<view class="left-circle"
						:style="[size,leftCircle,leftValue]">
					</view>
				</view>
				<view class="right" :style="[size]">
					<view class="right-circle" :style="[size,rightcircle,rightValue]"></view>
				</view>
				<view class="inner" :style="[inner]">
					{{value}}%
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	/*
	 * countDown 圆形进度条，不使用canvas,仅css实现
	 * @property {Number} widths 圆环的总体大小 (单位px)
	 * @property {Number} breadth 圆环中间区域的大小 (单位px)
	 * @property {activeColor} activeColor 圆环中间区域的背景色
	 * @property {String} defaultColor 圆环中间区域默认的背景颜色
	 */
	export default {
		props: {
			value: {
				type: Number,
				default: 10
			},
			widths: {
				type: Number,
				default: 50
			},
			breadth: {
				type: Number,
				default: 6
			},
			activeColor: {
				type: String,
				default: '#10b060'
			},
			defaultColor: {
				type: String,
				default: '#FAFBFF'
			},
		},
		data() {
			return {
			}
		},
		mounted() {
		},
		methods: {
		},
		computed: {
			circle() {
				const {
					widths,
					defaultColor
				} = this
				return {
					width: `${widths}px`,
					height: `${widths}px`,
					background: defaultColor
				}
			},
			size() {
				const {
					widths
				} = this
				return {
					width: `${widths /2}px`,
					height: `${widths}px`
				}
			},
			leftCircle() {
				const {
					widths,
					activeColor
				} = this
				return {
					borderTopLeftRadius: `${widths}px`,
					borderBottomLeftRadius: `${widths}px`,
					background: activeColor
				}
			},
			rightcircle() {
				const {
					widths,
					activeColor
				} = this
				return {
					borderTopRightRadius: `${widths}px`,
					borderBottomRightRadius: `${widths}px`,
					background: activeColor
				}
			},
			leftValue() {
				const {
					value,
				} = this
				let str = value<=50?'rotate(180deg)':`rotate(${(((value-50)/50)*180)+180}deg)`
				return {
					transform: str
				}
			},
			rightValue() {
				const {
					value
				} = this
				let str = value>=50?'rotate(0deg)':`rotate(${((value/50)*180)-180}deg)`
				return {
					transform: str
				}
			},
			inner() {
				const {
					widths,
					breadth
				} = this
				return {
					width: `${widths - breadth}px`,
					height: `${widths - breadth}px`,
					
				}
			}
		},
		watch: {

		}
	}
</script>

<style>
	.circle {
		border-radius: 50%;
		position: relative;
	}

	.left,
	.right {
		position: absolute;
		overflow: hidden;
	}

	.left-circle {
		transition: all .5s;
		transform-origin: right center;
		transform: rotate(180deg);
	}

	.right-circle {
		transition: all .5s;
		transform-origin: left center;
		transform: rotate(-180deg);
	}

	.right {
		right: 0;
	}

	.inner {
		background: #fff;
		position: absolute;
		z-index: 999;
		border-radius: 100%;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		color: #A8A8A8;
	}
</style>
