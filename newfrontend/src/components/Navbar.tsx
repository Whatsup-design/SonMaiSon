const navItems = ['Chat', 'Voice', 'Community', 'Safety'];

export function Navbar() {
  return (
    <header className="absolute left-0 right-0 top-0 z-30">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 text-white sm:px-8">
        <a href="#top" className="flex items-center gap-3 font-bold tracking-wide">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-sm text-blurple">
            SM
          </span>
          <span>SonMaiSon</span>
        </a>
        <div className="hidden items-center gap-8 text-sm font-semibold md:flex">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="transition hover:text-honey">
              {item}
            </a>
          ))}
        </div>
        <a
          href="#download"
          className="rounded-full bg-white px-5 py-2 text-sm font-bold text-ink shadow-soft transition hover:-translate-y-0.5 hover:bg-honey"
        >
          Open App
        </a>
      </nav>
    </header>
  );
}
