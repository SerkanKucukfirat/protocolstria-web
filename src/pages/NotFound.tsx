import { Link } from 'react-router-dom'
import { Arrow } from '../components/ui'

export default function NotFound() {
  return (
    <section className="phero nf">
      <div className="phero-tree" aria-hidden />
      <div className="wrap phero-in">
        <div className="phero-copy">
          <p className="eyebrow">404</p>
          <h1 className="display xl">Aradığınız sayfa bulunamadı</h1>
          <Link to="/" className="btn btn-light">
            Ana sayfaya dönün <Arrow />
          </Link>
        </div>
      </div>
    </section>
  )
}
