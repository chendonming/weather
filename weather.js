const axios = require('axios');
const vscode = require('vscode')
const key = vscode.workspace.getConfiguration().get('weather.key')
module.exports = {
  /**
   * 获取地理位置
   * @param {string} 地名
   */
  getLocation(location) {
    return axios({
      url: 'https://geoapi.heweather.net/v2/city/lookup',
      method: 'get',
      params: {
        location,
        key
      }
    })
  },
  /**
   * 实况天气
   */
  nowWeather(location) {
    return axios({
      url: 'https://devapi.heweather.net/v7/weather/now',
      method: 'get',
      params: {
        location,
        key
      }
    })
  },
  /**
   * 天气预报
   */
  forecast(location) {
    return axios({
      url: 'https://devapi.heweather.net/v7/weather/3d',
      method: 'get',
      params: {
        location,
        key
      }
    })
  },
  /**
   * 生活指数
   */
  getIndices(location) {
    return axios({
      url: 'https://devapi.qweather.com/v7/indices/1d',
      method: 'get',
      params: {
        location,
        key,
        type: '8',
        lang: 'zh'
      }
    })
  }
}
