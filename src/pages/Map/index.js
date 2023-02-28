import React from 'react'
import NavHeader from '../../components/NavHeader';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Item } from 'antd-mobile/lib/tab-bar';

import './index.css'

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
  }

  // 渲染覆盖物入口
  async renderOverlays(id) {
    const res = await axios.get(`http://localhost:8080/area/map?id=${id}`)
    const data = res.data.body

    const { nextZoom, type } = this.getTypeAndZoom()

    data.forEach(item => {
      // 创建覆盖物
      this.createOverlays(item, nextZoom, type)
    })
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
           <div class="bubble">
             <p class="name">${name}</p>
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
    label.setContent(`
           <div class="rect">
             <span class="housename">${name}</span>
             <span class="housenum">${count}</span>
             <i class="arrow"></i>
           </div>
        `)

    // 设置样式
    label.setStyle(labelStyle)

    // 设置单击事件
    label.addEventListener('click', () => {
      this.getHousesList(id)
    })

    // 添加覆盖物到地图中
    this.map.addOverlay(label)

  }

  // 获取小区房源数据
  async getHousesList(id) {
    const res = await axios.get(`http://localhost:8080/houses?cityId=${id}`)
    this.setState({
      housesList: res.data.body
    })
  }

  render() {
    return (
      <div className="map">
        {/* 导航栏 */}
        <NavHeader>地图找房</NavHeader>
        {/* 地图容器 */}
        <div id="container">
        </div>

        {/* 房源列表 */}
        <div className={["houseList", "show"].join(' ')}>
          <div className="titleWrap">
            <h1 className="listTitle">房屋列表</h1>
            <Link className="titleMore" to="/home/list">更多房源</Link>
          </div>

          <div className="houseItems">
            {/* 房屋结构 */}
            <div className="house">
              <div className="imgWrap">
                <img src="http://localhost:8080/img/swiper/3.png"></img>
              </div>
              <div className="content">
                <h3 className="title">
                  三期精装修两房，南北户型，房东诚意出租出门燎原双语
                </h3>
                <div className="desc">2室2厅1卫/82/南/阳光美景城</div>
                <div>
                  <span className={["tag", "tag1"].join(' ')}>
                    近地铁
                  </span>
                </div>
                <div className="price">
                  <span className="priceNum">8500</span> 元/月
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
