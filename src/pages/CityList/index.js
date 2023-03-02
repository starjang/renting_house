import React from "react";
import { Toast } from 'antd-mobile';
import axios from "axios";
import { getCurrentCity } from "../../utils";
// 导入 List 组件
import { AutoSizer, List } from 'react-virtualized';
import NavHeader from '../../components/NavHeader';
import './index.css'

// 数据格式化的方法
const formatCityData = (list) => {

  const cityList = {}

  // 遍历list数组
  list.forEach(item => {
    // 获取每一个城市的首字母
    const first = item.short.substr(0, 1)
    // 判断cityList是否有分类
    // cityList[first] => [{},{}]
    if (cityList[first]) {
      cityList[first].push(item);
    } else {
      cityList[first] = [item];
    }
  })

  // 获取索引数据
  const cityIndex = Object.keys(cityList).sort()

  return {
    cityList,
    cityIndex
  }
}

// 列表高度
const TITLE_HEIGHT = 36
const NAME_HEIGHT = 50

// 处理字母索引的方法
const formatCityIndex = (letter) => {
  switch (letter) {
    case '#':
      return '当前定位'
    case 'hot':
      return '热门定位'
    default:
      return letter.toUpperCase()
  }
}

// 存在房源的城市
const HOUSE_CITY = ['北京', '上海', '广州', '深圳'];

export default class CityList extends React.Component {

  state = {
    cityList: {},
    cityIndex: []
  }

  constructor(props) {
    super(props)

    this.state = {
      cityList: {},
      cityIndex: [],
      // 当前选中索引
      activeIndex: 0
    }

    //创建ref对象
    this.cityListComponent = React.createRef()
  }


  async componentDidMount() {
    await this.getCityLists()
    // 调用measureAllRows 提前计算, 实现list中scrolltorow的精确跳转
    // 调用时保证list组件中已有数据
    this.cityListComponent.current.measureAllRows();
  }

  // 获取城市列表的方法
  async getCityLists() {
    const res = await axios.get('http://localhost:8080/area/city?level=1')
    const { cityList, cityIndex } = formatCityData(res.data.body)
    console.log(cityList);

    // 获取热门城市数据
    const hotRes = await axios.get('http://localhost:8080/area/hot')
    cityList['hot'] = hotRes.data.body
    // 在第一项添加
    cityIndex.unshift('hot')

    // 获取当前定位城市
    const curCity = await getCurrentCity()
    cityList['#'] = [curCity]
    cityIndex.unshift('#')

    this.setState({
      cityList,
      cityIndex,
      // 当前选中索引
      activeIndex: 0
    })
  }

  // 每一行数据的渲染函数
  rowRenderer = ({
    key, // Unique key within array of rows
    index, // Index of row within collection
    isScrolling, // The List is currently being scrolled
    isVisible, // This row is visible within the List (eg it is not an overscanned row)
    style, // Style object to be applied to row (to position it) // 重点属性
  }) => {

    // 获取每一行的字母索引
    const { cityIndex, cityList } = this.state
    const letter = cityIndex[index]
    const cities = cityList[letter]

    return (
      <div key={key} style={style} className="city">
        <div className="title">{formatCityIndex(letter)}</div>
        {
          cities.map(item =>
            <div className="name" key={item
              .value} onClick={() => this.changeCity(item)}>
              {item.label}
            </div>
          )
        }
      </div>
    );
  }

  // 获取动态计算的高度
  getRowHeight = ({ index }) => {

    const { cityList, cityIndex } = this.state
    return TITLE_HEIGHT + cityList[cityIndex[index]].length * NAME_HEIGHT
  }

  // 渲染右侧索引列表
  renderCityIndex() {
    const { cityIndex, activeIndex } = this.state
    return cityIndex.map((item, index) =>
      <li className="city-index-item" key={item} onClick={() => {
        //console.log('当前索引号:', index);
        this.cityListComponent.current.scrollToRow(index)
      }}>
        <span className={activeIndex === index ? "index-active" : ''}>{item === 'hot' ? '热' : item.toUpperCase()}</span>
      </li >
    )
  }

  // 获取list组件中的行信息
  onRowsRendered = ({ startIndex }) => {
    if (this.state.activeIndex !== startIndex) {
      this.setState({
        activeIndex: startIndex
      })
    }
  }

  changeCity({ label, value }) {

    if (HOUSE_CITY.indexOf(label) > -1) {

      localStorage.setItem('local_city', JSON.stringify({ label, value }))
      this.props.history.go(-1)
    } else {
      Toast.info('该城市暂无房源数据', 1, null, false)
    }
  }

  render() {
    return (
      <div className="citylist">
        {/* 顶部导航栏 */}
        <NavHeader>城市选择</NavHeader>

        {/* 城市列表 */}
        <AutoSizer>
          {
            ({ width, height }) => (
              <List
                ref={this.cityListComponent}
                width={width}
                height={height}
                rowCount={this.state.cityIndex.length}
                rowHeight={this.getRowHeight}
                rowRenderer={this.rowRenderer}
                onRowsRendered={this.onRowsRendered}
                scrollToAlignment="start"
              />
            )
          }
        </AutoSizer>

        {/* 右侧索引 */}
        <ul className="city-index">
          {this.renderCityIndex()}
        </ul>
      </div>
    )
  }
}