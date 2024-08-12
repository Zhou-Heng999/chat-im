		import request from '@/utils/request'
		/**
		 * 结余
		 * @param {*} payload
		 */
		export const getBankType = payload => {
		  return request('/assets/balance', {
		    data: payload
		  })
		}
		
		