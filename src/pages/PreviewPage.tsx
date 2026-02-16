export default function PreviewPage() {
  return (
    <main className="page page-preview">
      <article className="resume-preview-sheet">
        <header>
          <h1>Your Name</h1>
          <p>email@example.com | +1 (000) 000-0000 | City, Country</p>
        </header>

        <section>
          <h2>Summary</h2>
          <p>Clean resume layout placeholder. No scoring, export, or validation implemented yet.</p>
        </section>

        <section>
          <h2>Education</h2>
          <p>Degree - Institution (Year)</p>
        </section>

        <section>
          <h2>Experience</h2>
          <p>Role - Company (Duration)</p>
        </section>

        <section>
          <h2>Projects</h2>
          <p>Project Name: Short project summary.</p>
        </section>

        <section>
          <h2>Skills</h2>
          <p>Skill 1, Skill 2, Skill 3</p>
        </section>
      </article>
    </main>
  );
}