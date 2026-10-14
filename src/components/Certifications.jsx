import { Award } from 'lucide-react'
import { certifications } from '../data/certifications'
export function Certifications() {
  return <section className="section-shell section tinted">
    <div className="section-heading compact"><p className="eyebrow">06 / CREDENTIALS</p><h2>Proof of<br /><em>momentum.</em></h2></div>
    <div className="credential-grid">
      {certifications.map(item => <article className="credential-card" key={item.name}>
        <div className="credential-icon"><Award size={18} /></div>
        <span>{item.status}</span>
        <h3>{item.name}</h3>
        <p>{item.organization}</p>
        <small>{item.skills}</small>
        {item.credentialUrl && <a className="credential-link" href={item.credentialUrl} target="_blank" rel="noopener noreferrer">
          View credential <span aria-hidden="true">↗</span>
        </a>}
      </article>)}
    </div>
  </section>
}