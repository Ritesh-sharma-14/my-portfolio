import { ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { profile } from '../data/profile'
export function Footer() { return <footer className="footer section-shell"><span className="brand"><span className="brand-mark"><ShieldCheck size={16} /></span>{profile.name}</span><span>Built with intent · {new Date().getFullYear()}</span><div className="footer-links"><Link to="/admin">Admin login</Link><Link to="/#top">Back to top ↑</Link></div></footer> }