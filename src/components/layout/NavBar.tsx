import { NavLink } from 'react-router-dom';

export function NavBar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white/70 px-4 py-3">
      <NavLink to="/" className="flex items-center gap-2 font-bold text-slate-800">
        <span>🧠</span>
        <span>Memorama</span>
      </NavLink>
      <nav className="flex gap-4 text-sm">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? 'font-semibold text-indigo-600' : 'text-slate-500')}
        >
          Jugar
        </NavLink>
        <NavLink
          to="/admin"
          className={({ isActive }) => (isActive ? 'font-semibold text-indigo-600' : 'text-slate-500')}
        >
          Admin
        </NavLink>
      </nav>
    </header>
  );
}
