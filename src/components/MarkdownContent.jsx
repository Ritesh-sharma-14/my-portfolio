import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function MarkdownContent({ children }) {
  return <div className="markdown-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown></div>
}
