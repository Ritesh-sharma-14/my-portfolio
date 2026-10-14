import { Menu, ShieldCheck, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { profile } from '../data/profile'
export function Navbar() {
  const [open, setOpen] = useState(false)
  const links = [['/src/About.jsx', 'About'], ['/src/Skills.jsx', 'Skills'], ['/src/Projects.jsx', 'Projects'], ['/src/Experience.jsx', 'Experience']]

  return <header className="nav">
    <Link className="brand" to="/" onClick={() => setOpen(false)}><span className="brand-mark"><ShieldCheck size={18} /></span><span>{profile.name.split(' ')[0]}<b>.sec</b></span></Link>
    <button className="menu-button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
    <nav className={open ? 'nav-links open' : 'nav-links'}>
      {links.map(([path, label]) => <Link key={path} to={path} onClick={() => setOpen(false)}>{label}</Link>)}
      <Link to="/blog" onClick={() => setOpen(false)}>Learning blog</Link>
      <Link className="nav-cta" to="/#contact" onClick={() => setOpen(false)}>Let’s connect <span>↗</span></Link>
    </nav>
  </header>
}