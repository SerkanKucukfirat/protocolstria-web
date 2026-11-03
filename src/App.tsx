import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import LinePage from './pages/Line'
import ProductPage from './pages/Product'
import { About, Application, Contact, Policies, Technology } from './pages/Pages'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="kabin-urunleri" element={<LinePage line="kabin" />} />
          <Route path="ev-devam-urunleri" element={<LinePage line="ev" />} />
          <Route path="urunler/:slug" element={<ProductPage />} />
          <Route path="teknoloji" element={<Technology />} />
          <Route path="uygulama" element={<Application />} />
          <Route path="hakkimizda" element={<About />} />
          <Route path="iletisim" element={<Contact />} />
          <Route path="politikalar" element={<Policies />} />
          <Route path="politikalarimiz" element={<Policies />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
