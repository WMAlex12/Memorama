import { Route, Routes } from 'react-router-dom';
import { NavBar } from './components/layout/NavBar';
import { GamePage } from './pages/GamePage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100">
      <NavBar />
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  );
}
