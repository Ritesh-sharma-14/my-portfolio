import { ArrowLeft, BookOpen, Eye, LogOut, Plus, Save, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, supabaseConfigured } from '../lib/supabase'

const emptyPost = { title: '', slug: '', excerpt: '', category: 'Learning', content: '', published: false }

function makeSlug(value) {
  return value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function ErrorMessage({ children }) {
  return children ? <p className="form-message form-error" role="alert">{children}</p> : null
}

export function Admin() {
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(!supabaseConfigured)
  const [adminCheck, setAdminCheck] = useState({ userId: null, isAdmin: null })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [posts, setPosts] = useState([])
  const [post, setPost] = useState(emptyPost)
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!supabaseConfigured) return undefined

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAdminCheck({ userId: null, isAdmin: null })
      setAuthReady(true)
    })
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setMessage(`Could not restore your session: ${error.message}`)
      setSession(data.session)
      setAuthReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let active = true
    if (!session?.user) return () => { active = false }

    supabase.from('blog_admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
      .then(async ({ data, error }) => {
        if (!active) return
        if (error) setMessage(`Could not verify admin access: ${error.message}`)
        const hasAdminAccess = Boolean(data)
        setAdminCheck({ userId: session.user.id, isAdmin: hasAdminAccess })
        if (!hasAdminAccess) return
        const { data: postData, error: postError } = await supabase.from('blog_posts')
          .select('id,title,slug,excerpt,category,content,published,created_at,updated_at')
          .order('updated_at', { ascending: false })
        if (!active) return
        if (postError) setMessage(`Could not load posts: ${postError.message}`)
        else setPosts(postData ?? [])
      })

    return () => { active = false }
  }, [session])

  const loadPosts = useCallback(async () => {
    const { data, error } = await supabase.from('blog_posts')
      .select('id,title,slug,excerpt,category,content,published,created_at,updated_at')
      .order('updated_at', { ascending: false })
    if (error) {
      setMessage(`Could not load posts: ${error.message}`)
      return
    }
    setPosts(data ?? [])
  }, [])

  async function signIn(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(`Login failed: ${error.message}`)
    setBusy(false)
  }

  async function signOut() {
    setBusy(true)
    const { error } = await supabase.auth.signOut()
    if (error) setMessage(`Could not log out: ${error.message}`)
    setBusy(false)
  }

  function startNewPost() {
    setPost(emptyPost)
    setEditingId(null)
    setMessage('')
  }

  function editPost(selectedPost) {
    setPost({
      title: selectedPost.title,
      slug: selectedPost.slug,
      excerpt: selectedPost.excerpt || '',
      category: selectedPost.category || 'Learning',
      content: selectedPost.content || '',
      published: selectedPost.published,
    })
    setEditingId(selectedPost.id)
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function savePost(event) {
    event.preventDefault()
    if (!post.title.trim() || !post.content.trim() || !post.slug.trim()) {
      setMessage('Add a title, URL slug, and post content before saving.')
      return
    }

    setBusy(true)
    setMessage('')
    const payload = { ...post, title: post.title.trim(), slug: makeSlug(post.slug), excerpt: post.excerpt.trim(), category: post.category.trim() || 'Learning' }
    const result = editingId
      ? await supabase.from('blog_posts').update(payload).eq('id', editingId)
      : await supabase.from('blog_posts').insert(payload)

    if (result.error) {
      setMessage(`Could not save post: ${result.error.message}`)
      setBusy(false)
      return
    }

    setMessage(post.published ? 'Post published and saved.' : 'Draft saved.')
    setPost(emptyPost)
    setEditingId(null)
    await loadPosts()
    setBusy(false)
  }

  async function deletePost(selectedPost) {
    if (!window.confirm(`Delete "${selectedPost.title}"? This can’t be undone.`)) return
    setBusy(true)
    setMessage('')
    const { error } = await supabase.from('blog_posts').delete().eq('id', selectedPost.id)
    if (error) setMessage(`Could not delete post: ${error.message}`)
    else {
      if (editingId === selectedPost.id) startNewPost()
      setMessage('Post deleted.')
      await loadPosts()
    }
    setBusy(false)
  }

  if (!supabaseConfigured) {
    return <main className="admin-screen"><section className="admin-card">
      <Link className="text-link" to="/"><ArrowLeft size={16} /> Return to portfolio</Link>
      <p className="eyebrow">ADMIN / SETUP REQUIRED</p>
      <h1>Connect your<br /><em>content service.</em></h1>
      <p>The secure admin panel needs a Supabase project. Follow the setup steps in the project README, then add its URL and public anon key to <code>.env.local</code>.</p>
    </section></main>
  }

  if (!authReady || (session && adminCheck.userId !== session.user.id)) return <main className="admin-screen"><p className="page-message">Checking secure admin access…</p></main>

  if (!session) return <main className="admin-screen">
    <section className="admin-card">
      <Link className="text-link" to="/"><ArrowLeft size={16} /> Return to portfolio</Link>
      <div className="admin-icon"><BookOpen size={22} /></div>
      <p className="eyebrow">PRIVATE AREA / ADMIN LOGIN</p>
      <h1>Your learning,<br /><em>your words.</em></h1>
      <p>Sign in to create, edit, publish, or remove learning notes.</p>
      <form className="admin-form login-form" onSubmit={signIn}>
        <label>Email address<input autoComplete="username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Password<input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        <ErrorMessage>{message}</ErrorMessage>
        <button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in as admin'}</button>
      </form>
      <p className="admin-security-note">Admin accounts are created in the Supabase dashboard; public sign-up is not available.</p>
    </section>
  </main>

  if (!adminCheck.isAdmin) return <main className="admin-screen"><section className="admin-card">
    <p className="eyebrow">ACCESS DENIED</p><h1>This account<br /><em>isn’t an admin.</em></h1>
    <ErrorMessage>{message || 'This account is not listed as an administrator.'}</ErrorMessage>
    <div className="admin-actions"><button className="button button-ghost" onClick={signOut} disabled={busy}>Sign out</button><Link className="text-link" to="/">Return to portfolio</Link></div>
  </section></main>

  return <main className="admin-dashboard">
    <header className="admin-topbar section-shell">
      <Link className="brand" to="/"><span className="brand-mark"><BookOpen size={17} /></span>Learning blog <b>/ Admin</b></Link>
      <div><span>{session.user.email}</span><button className="button button-ghost" onClick={signOut} disabled={busy}><LogOut size={15} /> Sign out</button></div>
    </header>
    <div className="admin-content section-shell">
      <div className="admin-title-row"><div><p className="eyebrow">CONTENT MANAGEMENT</p><h1>Manage your<br /><em>learning notes.</em></h1></div><button className="button button-primary" type="button" onClick={startNewPost}><Plus size={16} /> New post</button></div>
      <div className="admin-workspace">
        <form className="admin-form editor-form" onSubmit={savePost}>
          <div className="editor-title-row"><h2>{editingId ? 'Edit note' : 'New note'}</h2>{editingId && <button className="icon-button" type="button" aria-label="Cancel editing" onClick={startNewPost}><X size={18} /></button>}</div>
          <label>Title<input value={post.title} onChange={(event) => setPost({ ...post, title: event.target.value, slug: editingId ? post.slug : makeSlug(event.target.value) })} placeholder="What did you learn?" required /></label>
          <label>URL slug<input value={post.slug} onChange={(event) => setPost({ ...post, slug: event.target.value })} placeholder="a-clear-url-for-your-note" required /></label>
          <label>Short introduction<textarea rows="3" value={post.excerpt} onChange={(event) => setPost({ ...post, excerpt: event.target.value })} placeholder="A short summary readers will see before opening the post." /></label>
          <label>Topic<input value={post.category} onChange={(event) => setPost({ ...post, category: event.target.value })} placeholder="e.g. Networking, Blue Team" /></label>
          <label>Post content <span className="field-hint">Markdown supported — use ## for headings and ``` for code blocks.</span><textarea className="content-editor" rows="14" value={post.content} onChange={(event) => setPost({ ...post, content: event.target.value })} placeholder={'Write your learning note here…\n\nUse Markdown for headings, lists, links, and code snippets.'} required /></label>
          <label className="publish-toggle"><input type="checkbox" checked={post.published} onChange={(event) => setPost({ ...post, published: event.target.checked })} /><span>Publish this note for everyone to read</span></label>
          <ErrorMessage>{message}</ErrorMessage>
          <button className="button button-primary" type="submit" disabled={busy}><Save size={16} /> {busy ? 'Saving…' : editingId ? 'Save changes' : post.published ? 'Publish note' : 'Save draft'}</button>
          {!editingId && <button className="button button-ghost" type="button" onClick={startNewPost}>Clear form</button>}
        </form>
        <section className="admin-post-list">
          <div className="editor-title-row"><h2>Your notes</h2><span>{posts.length} total</span></div>
          {message && !editingId && <p className="form-message" role="status">{message}</p>}
          {posts.length === 0 ? <p className="empty-admin">Your drafts and published notes will appear here.</p> : posts.map((item) => <article className="admin-post-row" key={item.id}>
            <div><span className={item.published ? 'post-status published' : 'post-status'}>{item.published ? 'PUBLISHED' : 'DRAFT'}</span><h3>{item.title}</h3><p>/{item.slug}</p></div>
            <div className="admin-post-actions"><button className="button button-ghost" onClick={() => editPost(item)}>Edit</button>{item.published && <Link className="icon-button" aria-label={`View ${item.title}`} to={`/blog/${item.slug}`} target="_blank"><Eye size={16} /></Link>}<button className="icon-button danger-button" aria-label={`Delete ${item.title}`} onClick={() => deletePost(item)} disabled={busy}><Trash2 size={16} /></button></div>
          </article>)}
        </section>
      </div>
    </div>
  </main>
}
