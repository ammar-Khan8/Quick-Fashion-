import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Browse from "./pages/Browse";
import Cart from "./pages/Cart";
import Product from "./pages/Product";

import Navbar from "./Layout/Navbar";
import Footer from "./Layout/Footer";
import React from 'react'

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />

      <main style={{ paddingTop: '80px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:username" element={<Profile />} />
          {/* whats this for? :username is a route parameter that allows us to pass a username as part of the URL */}
          <Route path="/browse" element={<Browse />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/product/:id" element={<Product />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  )
}

export default App
