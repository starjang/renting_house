import React from 'react'
import { Button } from 'antd-mobile'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, NavLink, useRoutes } from 'react-router-dom'

import Home from './pages/Home'
import CityList from './pages/CityList'
import News from './pages/News'

const GetRoutes = () => {
  const routes = useRoutes([
    { path: '/', element: <Home /> },
    {
      path: '/home',
      element: <Home />,
      children: [
        { path: '/home/news', element: <News /> },
        { path: '*', element: <div>404</div> }
      ]
    },
    {
      path: '/citylist',
      element: <CityList />
    },
    { path: '*', element: <div>404 not found</div> }
  ])
  return routes
}

function App() {
  return (

    <Router>
      <div className="App">

        {/* 配置导航菜单 */}
        <ul>
          <li>
            <Link to="/home">首页</Link>
          </li>
          <li>
            <Link to="/citylist">城市选择</Link>
          </li>
        </ul>

        {/* 配置路由 */}
        {/*<Routes>*/}
        {/*<Route path='/home' element={<Home />}></Route>*/}
        {/*<Route path='/citylist' element={<CityList />}></Route>*/}
        {/*</Routes>*/}
        < GetRoutes />
      </div>

    </Router>

  );
}

export default App;
