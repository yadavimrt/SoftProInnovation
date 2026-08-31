import React from 'react'
import Home from './pages/user/Home'
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom'
import About from './pages/user/About'
import Contact from './pages/user/Contact'
import Product from './pages/user/Product'
import Login from './pages/user/Login'
import Register from './pages/user/Register'
import DashboardLayout from './pages/admin/DashboardLayout'
import DashboardOverview from './pages/admin/DashboardOverview'
import Categories from './pages/admin/Categories'
import AddCategory from './pages/admin/AddCategory'
import Products from './pages/admin/Products'
import Orders from './pages/admin/Orders'
import UsersList from './pages/admin/UsersList'
import Inventory from './pages/admin/Inventory'
import Complaints from './pages/admin/Complaints'

import AdminLogin from './pages/admin/AdminLogin'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import AddProduct from './pages/admin/AddProduct'

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
          <Route 
            path='/dashboard' 
            element={
              <AdminProtectedRoute>
                <DashboardLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path='categories' element={<Categories />} />
            <Route path='categories/add' element={<AddCategory />} />
            <Route path='add-category' element={<AddCategory />} />
            <Route path='categories/edit/:id' element={<AddCategory />} />
            <Route path='products' element={<Products />} />
            <Route path='products/add' element={<AddProduct />} />
            <Route path='add-product' element={<AddProduct />} />
            <Route path='products/edit/:id' element={<AddProduct isEditMode={true} />} />
            <Route path='orders' element={<Orders />} />
            <Route path='users' element={<UsersList />} />
            <Route path='inventory' element={<Inventory />} />
            <Route path='complaints' element={<Complaints />} />
          </Route>
          <Route path='/admin/login' element={<AdminLogin/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
export default App


