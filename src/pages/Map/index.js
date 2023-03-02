import React from 'react'
import NavHeader from '../../components/NavHeader';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Toast } from 'antd-mobile'

//import './index.css'
import styles from './index.module.css'

const bMap = window.BMapGL

// 覆盖物样式
const labelStyle = {
  cursor: 'pointer',
  border: '0px solid rgb(255, 0, 0)',
  padding: '0px',
  whiteSpace: 'nowrap',
  fontSize: '12px',
  color: 'rgb(255, 255, 255)',
  textAlign: 'center'
}

export default class Map extends React.Component {

  state = {

    housesList: []
  }

  componentDidMount() {

    this.initMap()
  }

  // 初始化地图
  initMap() {

    // 获取当前城市
    const { label, value } = JSON.parse(localStorage.getItem('local_city'))
    // 创建地图实例
    const map = new bMap.Map("container")
    // 在其他方法中获取地图对象
    this.map = map

    const myGeo = new bMap.Geocoder()
    myGeo.getPoint(label, async (point) => {
      if (point) {
        map.centerAndZoom(point, 11)
        map.addControl(new bMap.NavigationControl())
        map.addControl(new bMap.ScaleControl())
        //map.addOverlay(new bMap.Marker(point))

        // 调用 renderOverlays
        this.renderOverlays(value)
      }
    }, label)

    // 给地图绑定移动事件
    map.addEventListener('movestart', () => {

      if (this.state.isShowList) {
        this.setState({
          isShowList: false
        })
      }
    })
  }

  // 渲染覆盖物入口
  async renderOverlays(id) {

    try {
      // 开启loading
      Toast.loading('加载中...', 0, null, false)

      const res = await axios.get(`http://localhost:8080/area/map?id=${id}`)
      const data = res.data.body

      //关闭loading
      Toast.hide()

      const { nextZoom, type } = this.getTypeAndZoom()

      data.forEach(item => {
        // 创建覆盖物
        this.createOverlays(item, nextZoom, type)
      })
    } catch (error) {
      //关闭loading
      Toast.hide()
    }


  }

  // 计算要绘制的覆盖物类型和下一个缩放级别
  getTypeAndZoom() {
    // 获取当前缩放级别
    const zoom = this.map.getZoom()
    let nextZoom, type
    if (zoom >= 10 && zoom < 12) {
      // 区
      type = 'circle'
      nextZoom = 13
    } else if (zoom >= 12 && zoom < 14) {
      // 镇
      type = 'circle'
      nextZoom = 15
    } else if (zoom >= 14 && zoom < 16) {
      // 小区
      type = 'rect'
    }

    return { type, nextZoom }
  }

  // 创建覆盖物
  createOverlays(data, nextZoom, type) {

    // 为每一条数据创建覆盖物
    const {
      coord: { longitude, latitude },
      label: areaName,
      count,
      value
    } = data

    const areaPoint = new bMap.Point(longitude, latitude)

    if (type === 'circle') {
      // 区、镇
      this.createCircle(areaPoint, areaName, count, value, nextZoom)

    } else {
      // 小区
      this.createRect(areaPoint, areaName, count, value)
    }
  }

  createCircle(point, name, count, id, zoom) {

    const opts = {
      position: point,
      offset: new bMap.Size(-35, -35)
    }

    const label = new bMap.Label('', opts)

    // 设置唯一的id
    label.id = id

    // 设置房源覆盖物
    label.setContent(`
      <div class="${styles.bubble}">
        <p class="${styles.name}">${name}</p>
        <p>${count}套</p>
      </div>
    `)

    // 设置样式
    label.setStyle(labelStyle)

    // 设置单击事件
    label.addEventListener('click', () => {

      // 重新调用 renderOverlays
      this.renderOverlays(id)

      // 放大地图
      this.map.centerAndZoom(point, zoom)

      // 清除当前覆盖物
      this.map.clearOverlays()
    })

    // 添加覆盖物到地图中
    this.map.addOverlay(label)
  }

  createRect(point, name, count, id) {

    const opts = {
      position: point,
      offset: new bMap.Size(-50, -28)
    }

    const label = new bMap.Label('', opts)

    // 设置唯一的id
    label.id = id

    // 设置房源覆盖物
    // 设置房源覆盖物内容
    label.setContent(`
      <div class="${styles.rect}">
        <span class="${styles.housename}">${name}</span>
        <span class="${styles.housenum}">${count}套</span>
        <i class="${styles.arrow}"></i>
      </div>
    `)
    // 设置样式
    label.setStyle(labelStyle)

    // 设置单击事件
    label.addEventListener('click', e => {

      this.getHousesList(id)

      // 获取当前点击项
      console.log(e);
      //const target = e.changedTouches[0]
      //this.map.panBy(
      //  window.innerWidth / 2 - target.clientX,
      //  (window.innerHeight - 330) / 2 - target.clientY
      //)
    })

    // 添加覆盖物到地图中
    this.map.addOverlay(label)

  }

  // 获取小区房源数据
  async getHousesList(id) {
    let res = await axios.get('http://localhost:8080/houses?cityId=' + id)
    this.setState({
      housesList: res.data.body.list,
      isShowList: true
    })
  }

  // 渲染房源列表
  renderHousesList() {
    return this.state.housesList.map(item => (
      <div className={styles.house} key={item.houseCode}>
        <div className={styles.imgWrap}>
          <img className={styles.img} src={`http://localhost:8080${item.houseImg}`} alt="" />
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{item.title}</h3>
          <div className={styles.desc}>{item.desc}</div>
          <div>
            {/* ['近地铁', '随时看房'] */}
            {item.tags.map((tag, index) => {
              const tagClass = 'tag' + (index + 1)
              return (
                <span
                  className={[styles.tag, styles[tagClass]].join(' ')}
                  key={tag}
                >
                  {tag}
                </span>
              )
            })}
          </div>
          <div className={styles.price}>
            <span className={styles.priceNum}>{item.price}</span> 元/月
          </div>
        </div>
      </div>
    )
    )
  }

  render() {
    return (
      <div className={styles.map}>
        {/* 顶部导航栏组件 */}
        <NavHeader>地图找房</NavHeader>
        {/* 地图容器元素 */}
        <div id="container" className={styles.container} />

        {/* 添加 styles.show 展示房屋列表 */}
        <div
          className={[
            styles.houseList,
            this.state.isShowList ? styles.show : ''
          ].join(' ')}
        >
          <div className={styles.titleWrap}>
            <h1 className={styles.listTitle}>房屋列表</h1>
            <Link className={styles.titleMore} to="/home/list">
              更多房源</Link>
          </div>
          <div className={styles.houseItems}>
            {/* 房屋结构 */}
            {this.renderHousesList()}
          </div>
        </div>
      </div>
    )
  }
}
