const columns = [
  ['Product', 'Download', 'Guilds', 'Voice', 'Video'],
  ['Resources', 'Support', 'Safety', 'Developers', 'Status'],
  ['Company', 'About', 'Careers', 'Brand', 'News'],
];

export function Footer() {
  return (
    <footer className="bg-ink px-4 py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_2fr]">
        <div>
          <div className="text-3xl font-black">SonMaiSon</div>
          <p className="mt-3 max-w-sm text-sm font-medium text-white/55">
            A polished landing page for a Discord-like realtime communication app.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map(([title, ...links]) => (
            <div key={title}>
              <div className="mb-3 text-sm font-black text-mint">{title}</div>
              <div className="space-y-2">
                {links.map((link) => (
                  <a key={link} href="#" className="block text-sm text-white/60 hover:text-white">
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
