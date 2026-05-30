import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Map from './pages/Map';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-[#070c14]">
        {/* Sidebar — desktop only */}
        <div className="hidden lg:flex flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto relative">
          <Routes>
            <Route path="/"    element={<Home />} />
            <Route path="/map" element={<Map />} />
            <Route path="*"    element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </BrowserRouter>
  );
}
