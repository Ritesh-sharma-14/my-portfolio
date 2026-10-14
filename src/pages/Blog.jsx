import { ArrowLeft, ArrowUpRight, Clock3 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MarkdownContent } from '../components/MarkdownContent'
import { supabase, supabaseConfigured } from '../lib/supabase'

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
}

function BlogSetupMessage() {
  return <div className="page-state"><p className="eyebrow">LEARNING NOTES</p><h1>The blog is<br /><em>being set up.</em></h1><p>Posts will show here once the site is connected to its content service.</p><Link className="text-link" to="/">Back to portfolio <ArrowUpRight size={16} /></Link></div>
}

export function Blog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(supabaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (!supabaseConfigured) return () => { active = false }

    supabase.from('blog_posts').select('id,title,slug,excerpt,category,created_at')
      .eq('published', true).order('created_at', { ascending: false })
      .then(({ data, error: queryError }) => {
        if (!active) return
        if (queryError) setError(`Could not load posts: ${queryError.message}`)
        else setPosts(data ?? [])
        setLoading(false)
      })

    return () => { active = false }
  }, [])

  if (!supabaseConfigured) return <main className="blog-page section-shell"><BlogSetupMessage /></main>

  return <main className="blog-page section-shell">
    <header className="blog-heading">
      <p className="eyebrow">FIELD NOTES / LEARNING IN PUBLIC</p>
      <h1>Curiosity,<br /><em>documented.</em></h1>
      <p className="hero-summary">Practical notes from cybersecurity labs, projects, and the ideas I’m learning along the way.</p>
    </header>
    {loading && <p className="page-message">Loading posts…</p>}
    {error && <p className="form-message form-error" role="alert">{error}</p>}
    {!loading && !error && posts.length === 0 && <div className="empty-posts"><p className="card-kicker">NOTHING PUBLISHED YET</p><h2>First notes are on the way.</h2><p>When a post is published, it will appear here for everyone to read.</p></div>}
    <div className="blog-grid">
      {posts.map((post, index) => <article className="blog-card" key={post.id}>
        <p className="card-kicker">{post.category || 'LEARNING'} <span> / {String(index + 1).padStart(2, '0')}</span></p>
        <h2><Link to={`/blog/${post.slug}`}>{post.title}</Link></h2>
        <p>{post.excerpt || 'A learning note from my cybersecurity journey.'}</p>
        <div className="blog-card-bottom"><time dateTime={post.created_at}>{formatDate(post.created_at)}</time><Link className="text-link" to={`/blog/${post.slug}`}>Read note <ArrowUpRight size={15} /></Link></div>
      </article>)}
    </div>
  </main>
}

export function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(supabaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (!supabaseConfigured) return () => { active = false }

    supabase.from('blog_posts').select('title,slug,excerpt,content,category,created_at')
      .eq('slug', slug).eq('published', true).maybeSingle()
      .then(({ data, error: queryError }) => {
        if (!active) return
        if (queryError) setError(`Could not load this post: ${queryError.message}`)
        else setPost(data)
        setLoading(false)
      })

    return () => { active = false }
  }, [slug])

  if (!supabaseConfigured) return <main className="blog-page section-shell"><BlogSetupMessage /></main>
  if (loading) return <main className="blog-page section-shell"><p className="page-message">Loading post…</p></main>
  if (error) return <main className="blog-page section-shell"><p className="form-message form-error" role="alert">{error}</p><Link className="text-link" to="/blog"><ArrowLeft size={16} /> All notes</Link></main>
  if (!post) return <main className="blog-page section-shell"><div className="page-state"><p className="eyebrow">404 / NOT FOUND</p><h1>This note isn’t<br /><em>published.</em></h1><Link className="text-link" to="/blog"><ArrowLeft size={16} /> All notes</Link></div></main>

  return <main className="blog-page section-shell">
    <article className="article-page">
      <Link className="text-link article-back" to="/blog"><ArrowLeft size={16} /> All notes</Link>
      <p className="eyebrow">{post.category || 'LEARNING'} <span> / {formatDate(post.created_at)}</span></p>
      <h1>{post.title}</h1>
      {post.excerpt && <p className="article-excerpt">{post.excerpt}</p>}
      <div className="article-meta"><Clock3 size={15} /> Learning notes · written in Markdown</div>
      <MarkdownContent>{post.content}</MarkdownContent>
    </article>
  </main>
}
