import { Link, NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Builder', to: '/builder' },
  { label: 'Preview', to: '/preview' },
  { label: 'Proof', to: '/proof' }
];

export default function TopNav() {
  return (
    <header className="top-nav-wrap">
      <Link className="brand" to="/">
        AI Resume Builder
      </Link>
      <nav className="top-nav" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
