/**
 * @name: 字符省略号处理
 * @params value：要处理的值，beforeCount：前位数，afterCount：后位数
 * @returns 0xA0...648b
 */
 export function ellipsis(value, beforeCount = 4, afterCount = 4, symbol = '...') {
  if (!value || value === 'undefined') return ''
  
  if(String(value).length < beforeCount) symbol = ''
  
  return (
    value.substr(0, beforeCount) +
    symbol +
    value.substr(value.length - afterCount)
  );
}

/**
 * 数字格式化 （1234567890 --> 1,234,567,890）
 * @param num 数值
 */
export function toThousandslsFilter(num, digits) {
  return (+num || 0)
    .toFixed(digits || 0)
    .toString()
    .replace(/^-?\d+/g, m => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
}

// 判断数据格式-->小数点后两位
export function matchDecimal2(num) {
  return /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{0,2})))$/.test(num)
}

// 保留小数位
export function decimal_place(value, num) {
  if (!value) return
  let v = value
  if (Object.prototype.toString.call(value) === '[object String]') {
    v = v * 1
  }
  return v.toFixed(num)
}
// 金额分转元
export function toYuan(num) {
  num = num * 0.01 //分到元
  num = num.toString() //转成字符串
  if (num.split('.').length < 2) {
    num += '.00'
  } else {
    if (num.split('.')[1].length < 2) num += '0'
  }
  let reg =
    num.indexOf('.') > -1
      ? /(\d{1,3})(?=(?:\d{3})+\.)/g
      : /(\d{1,3})(?=(?:\d{3})+$)/g
  return num.replace(reg, '$1,')
}

// 银行卡格式化
export function bankcard_format(str) {
  if (!str || str === '') return
  if (typeof str == 'number') str = str.toString()
  const begin = str.substr(0, 4)
  const end = str.slice(str.length - 4, str.length)
  return begin + ' ****** ' + end
}

// 银行卡尾号（4位）
export function bankcard_digits(str) {
  if (!str || str == '') return
  if (typeof str == 'number') str = str.toString()
  return str.substr(str.length - 4, str, length)
}

/**
 * 下划线转驼峰
 * @param string
 * @returns {*}
 */
export function underLine2CamelCase(string) {
  return string.replace(/_([a-z])/g, function(all, letter) {
    return letter.toUpperCase()
  })
}

/**
 * @name: 日期格式化
 * @params value：要处理的值
 * @returns 年月日时分秒
 */
export function formatDate(value) {
  if (!value) return "";
  if (value.toString().length == 10) value = parseInt(value * 1000);
  let date = new Date(value);
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  m = m < 10 ? "0" + m : m;
  let d = date.getDate();
  d = d < 10 ? "0" + d : d;
  let h = date.getHours();
  h = h < 10 ? "0" + h : h;
  let mi = date.getMinutes();
  let s = date.getSeconds();
  mi = mi < 10 ? "0" + mi : mi;
  s = s < 10 ? "0" + s : s;

  return { y, m, d, h, mi, s };
}

/**
* @name: 日期格式化(静态显示)
* @param：valie: 要处理的值  format：格式化
* @return：2021-01-01 00:00:00
*/
export function dateShow(value, format = 'YYYY-MM-DD HH:mm:ss') {
  if(!value || value === '0') return '--'
  const date = formatDate(value)
  if(format === 'YYYY-MM-DD HH:mm:ss') {
    return `${date.y}-${date.m}-${date.d} ${date.h}:${date.mi}:${date.s}`
  }else if(format === 'YYYY-MM-DD HH:mm') {
    return `${date.y}-${date.m}-${date.d} ${date.h}:${date.mi}`
  }else if(format === 'MM-DD HH:mm:ss') {
    return `${date.m}-${date.d} ${date.h}:${date.mi}:${date.s}`
  }else if(format === 'YYYY-MM-DD') {
    return `${date.y}-${date.m}-${date.d}`
  }else if(format === 'HH:mm:ss') {
    return `${date.h}:${date.mi}:${date.s}`
  }
}
