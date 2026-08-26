import React from 'react'
import Home from './Home'
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom'
import About from './components/About'
import Contact from './components/Contact'
import Product from './components/Product'
import Login from './components/Login'
import Register from './components/Register'
import DashboardLayout from './components/DashboardLayout'
import DashboardOverview from './components/DashboardOverview'
import Categories from './components/Categories'
import Products from './components/Products'
import Orders from './components/Orders'
import UsersList from './components/UsersList'
import Inventory from './components/Inventory'
import Complaints from './components/Complaints'


export const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/about' element={<About />}></Route>
          <Route path='/contact' element={<Contact />}></Route>
          <Route path='/Product' element={<Product />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/register' element={<Register />}></Route>
          <Route path='/dashboard' element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path='categories' element={<Categories />} />
            <Route path='products' element={<Products />} />
            <Route path='orders' element={<Orders />} />
            <Route path='users' element={<UsersList />} />
            <Route path='inventory' element={<Inventory />} />
            <Route path='complaints' element={<Complaints />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}
export default App


