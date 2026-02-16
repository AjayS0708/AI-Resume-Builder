import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <main className="page page-home">
      <section className="hero-card">
        <h1>Build a Resume That Gets Read.</h1>
        <p>Premium structure-first workflow for drafting your resume with clarity.</p>
        <Link className="cta-button" to="/builder">
          Start Building
        </Link>
      </section>
    </main>
  );
}