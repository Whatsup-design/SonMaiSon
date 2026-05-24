export function DownloadCTA() {
  return (
    <section id="download" className="bg-cloud px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mx-auto mb-5 w-fit rounded-full bg-blurple px-5 py-2 text-sm font-black text-white">
          Ready for the next build
        </p>
        <h2 className="text-4xl font-black leading-tight sm:text-6xl">Bring the whole crew into one room.</h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-ink/68">
          A polished landing page foundation for your Discord-style app, built with reusable React
          components and Tailwind CSS.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="#top"
            className="rounded-full bg-ink px-8 py-4 text-base font-extrabold text-white shadow-soft transition hover:-translate-y-1"
          >
            Back to top
          </a>
          <a
            href="#chat"
            className="rounded-full bg-white px-8 py-4 text-base font-extrabold text-ink shadow-soft ring-1 ring-ink/8 transition hover:-translate-y-1 hover:bg-honey"
          >
            Explore layout
          </a>
        </div>
      </div>
    </section>
  );
}
