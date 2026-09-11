import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { StoreProvider } from "./StoreContext"
import Header from "./Header"
import Footer from "./Footer"
import Products from "./Products"
import MobilesPage from "./Components/MobilesPage"
import LaptopsPage from "./Components/LaptopsPage"
import TabletsPage from "./Components/TabletsPage"
import AccessoriesPage from "./Components/AccessoriesPage"
import AllProductsPage from "./Components/AllProductsPage"
import SearchPage from "./Components/SearchPage"
import CartPage from "./Components/CartPage"
import MyOrdersPage from "./Components/MyOrdersPage"
import ProductPage from "./Components/ProductPage"

function ComingSoon({ label }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-gray-50">
      <span className="text-5xl">🚧</span>
      <h2 className="text-2xl font-bold text-gray-700">{label}</h2>
      <p className="text-gray-400 text-sm">This page is coming soon.</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/"             element={<Products />} />
              <Route path="/product/:id"  element={<ProductPage />} />
              <Route path="/all-products" element={<AllProductsPage />} />
              <Route path="/search"       element={<SearchPage />} />
              <Route path="/cart"         element={<CartPage />} />
              <Route path="/my-orders"    element={<MyOrdersPage />} />
              <Route path="/mobiles"      element={<MobilesPage />} />
              <Route path="/laptops"      element={<LaptopsPage />} />
              <Route path="/tablets"      element={<TabletsPage />} />
              <Route path="/accessories"  element={<AccessoriesPage />} />
              <Route path="/smartwatches" element={<ComingSoon label="Smartwatches" />} />
              <Route path="/gaming"       element={<ComingSoon label="Gaming" />} />
              <Route path="/deals"        element={<ComingSoon label="Deals" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </StoreProvider>
    </BrowserRouter>
  )
}

export default App

