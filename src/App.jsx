import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { Admin } from './pages/Admin'
import { Blog, BlogPost } from './pages/Blog'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'

function PublicLayout({ children }) {
  return <><Navbar />{children}<Footer /></>
}

function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
    <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
    <Route path="/blog/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />
    <Route path="/admin" element={<Admin />} />
    <Route path="*" element={<PublicLayout><main className="section-shell page-state"><h1>Page not found</h1><a className="button button-primary" href="/">Back to home</a></main></PublicLayout>} />
  </Routes></BrowserRouter>
}

export default App
