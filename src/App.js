import React from 'react'
import { Button } from 'antd-mobile'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, NavLink } from 'react-router-dom'

import Home from './pages/Home'
import CityList from './pages/CityList'

function App() {
  return (

    <Router>
      <div className="App">

        {/* 配置导航菜单 */}

        {/* 配置路由 */}
        <Routes>
          <Route path='/home' element={<Home />}></Route>
          <Route path='/citylist' element={<CityList />}></Route>
        </Routes>
      </div>
    </Router>

  );
}

export default App;
