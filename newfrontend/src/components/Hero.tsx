import { ChatPreview } from './ChatPreview';

export function Hero() {
  return (
    <section id="top" className="mesh-bg relative min-h-[94vh] overflow-hidden pt-28 text-white">
      <div className="noise-layer absolute inset-0" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-cloud to-transparent" />
      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 pb-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex rounded-full bg-white/14 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur">
            Voice, chat, and community rooms
          </p>
          <h1 className="text-5xl font-black leading-[0.95] sm:text-6xl lg:text-7xl">
            SonMaiSon
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/86 sm:text-xl">
            A Discord-inspired landing experience for friends, teams, and hackathon crews
            who need one place to talk, call, and move fast together.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#download"
              className="rounded-full bg-white px-7 py-4 text-center text-base font-extrabold text-ink shadow-glow transition hover:-translate-y-1 hover:bg-honey"
            >
              Download for Windows
            </a>
            <a
              href="#chat"
              className="rounded-full bg-ink px-7 py-4 text-center text-base font-extrabold text-white shadow-soft transition hover:-translate-y-1 hover:bg-[#222431]"
            >
              Open in browser
            </a>
          </div>
        </div>
        <div className="relative min-h-[560px]">
          <ChatPreview />
        </div>
      </div>
    </section>
  );
}
