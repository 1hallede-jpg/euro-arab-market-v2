import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Stores from './pages/Stores'
import StoreDetail from './pages/StoreDetail'
import Search from './pages/Search'
import Sindbad from './pages/Sindbad'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import SecretAdmin from './pages/SecretAdmin'
import CityPage from './pages/CityPage'
import AddStore from './pages/AddStore'
import TermsPage from './pages/TermsPage'
import MerchantRegister from './pages/MerchantRegister'
import AdminMerchants from './pages/AdminMerchants'
import NotFound from './pages/NotFound'
import CookieConsent from './components/CookieConsent'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stores" element={<Stores />} />
        <Route path="/stores/:id" element={<StoreDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/sindbad" element={<Sindbad />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/sa" element={<SecretAdmin />} />
        <Route path="/city/:citySlug" element={<CityPage />} />
        <Route path="/add-store" element={<AddStore />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/merchant/register" element={<MerchantRegister />} />
        <Route path="/admin/merchants" element={<AdminMerchants />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CookieConsent />
    </>
  )
}
