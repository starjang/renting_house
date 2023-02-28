import axios from "axios";

export const getCurrentCity = () => {

  const localCity = JSON.parse(localStorage.getItem('local_city'))

  if (!localCity) {

    // 使用promise
    return new Promise((resolve, reject) => {

      // 获取当前位置
      var myCity = new window.BMapGL.LocalCity();

      myCity.get(async res => {

        try {

          const result = await axios.get(`http://localhost:8080/area/info?name=${res.name}`)
          localStorage.setItem('local_city', JSON.stringify(result.data.body))
          resolve(result.data.body)

        } catch (e) {
          // 获取定位失败
          reject(e)
        }
      })
    })
  }

  // 如果存在本地定位也要返回promise
  return Promise.resolve(localCity);
}