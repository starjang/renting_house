import React from "react";
import { NavBar, Icon } from 'antd-mobile';

// 导入withRouter
import { withRouter } from "react-router-dom";

// 导入props校验
import { PropTypes } from "prop-types";

// 导入样式
import './index.css'
//import styles from './index.module.css'

function NavHeader({ children, history, onLeftClick }) {

  // 默认点击行为
  const defaultHandler = () => history.go(-1)

  return (
    < NavBar
      // 使用module方式
      //className={styles.navBar}
      className="navBar"
      mode="light"
      icon={< Icon type="left" />}
      onLeftClick={onLeftClick || defaultHandler}
    >{children}</NavBar >
  )
}

// 添加校验
NavHeader.propTypes = {
  children: PropTypes.string.isRequired,
  onLeftClick: PropTypes.func
}

// 函数的返回值也是一个组件
export default withRouter(NavHeader)