const axios = require('axios');

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
        key: '579fbf44a7b24519a9d50e35258c1467'
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
        key: '579fbf44a7b24519a9d50e35258c1467'
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
        key: '579fbf44a7b24519a9d50e35258c1467'
      }
    })
  }
}
