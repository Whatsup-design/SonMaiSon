const stats = [
  ['Voice', 'Instant rooms'],
  ['Guilds', 'Custom spaces'],
  ['DMs', 'Fast private chat'],
  ['Invites', 'One-link join'],
];

export function SocialProof() {
  return (
    <section className="bg-white px-4 py-10">
      <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-ink/10 p-5">
            <div className="text-sm font-black uppercase tracking-[0.12em] text-discord">
              {label}
            </div>
            <div className="mt-2 text-2xl font-black">{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
