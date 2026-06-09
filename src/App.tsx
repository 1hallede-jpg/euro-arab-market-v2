import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import Stores from "./pages/Stores";
import StoreDetail from "./pages/StoreDetail";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Search from "./pages/Search";
import Sindbad from "./pages/Sindbad";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

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
      <Route path="/admin" element={<Admin />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
