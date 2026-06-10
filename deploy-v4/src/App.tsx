import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Stores from './pages/Stores'
import StoreDetail from './pages/StoreDetail'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import Search from './pages/Search'
import Sindbad from './pages/Sindbad'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import OwnerDashboard from './pages/OwnerDashboard'
import SeedPage from './pages/SeedPage'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/stores" element={<Stores />} />
      <Route path="/stores/:slug" element={<StoreDetail />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/search" element={<Search />} />
      <Route path="/sindbad" element={<Sindbad />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/owner" element={<OwnerDashboard />} />
      <Route path="/seed" element={<SeedPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
