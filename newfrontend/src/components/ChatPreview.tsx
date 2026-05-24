const servers = ['S', 'G', 'M', 'D'];
const channels = ['welcome', 'general', 'voice-room', 'build-log'];
const messages = [
  { name: 'Sonson', color: 'bg-honey', body: 'Landing page is ready for review.' },
  { name: 'Milky', color: 'bg-coral', body: 'Joining voice in five.' },
  { name: 'Taj', color: 'bg-lagoon', body: 'DM search and invite flow look good.' },
];

export function ChatPreview() {
  return (
    <div className="float-slow absolute inset-x-0 top-0 mx-auto w-full max-w-[690px] rounded-[28px] bg-[#191b29] p-3 shadow-glow ring-1 ring-white/10 lg:right-0">
      <div className="grid h-[520px] grid-cols-[72px_150px_1fr] overflow-hidden rounded-[22px] bg-[#232638] text-white sm:grid-cols-[84px_190px_1fr]">
        <aside className="flex flex-col items-center gap-4 bg-[#151722] py-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blurple font-black">SM</div>
          {servers.map((server, index) => (
            <div
              key={server}
              className={`grid h-11 w-11 place-items-center rounded-2xl font-bold ${
                index === 1 ? 'bg-lagoon text-white' : 'bg-white/10 text-white/72'
              }`}
            >
              {server}
            </div>
          ))}
        </aside>
        <aside className="hidden bg-[#202334] p-4 sm:block">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/48">Channels</p>
          <div className="space-y-2">
            {channels.map((channel, index) => (
              <div
                key={channel}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  index === 1 ? 'bg-white/12 text-white' : 'text-white/58'
                }`}
              >
                # {channel}
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-xl bg-[#151722] p-3">
            <p className="text-xs font-bold text-white/50">Voice Connected</p>
            <p className="mt-1 text-sm font-bold text-lagoon">general lounge</p>
          </div>
        </aside>
        <section className="flex min-w-0 flex-col">
          <div className="flex h-16 items-center justify-between border-b border-white/8 px-5">
            <div>
              <p className="font-bold"># general</p>
              <p className="text-xs text-white/45">8 online</p>
            </div>
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-lagoon" />
              <span className="h-3 w-3 rounded-full bg-honey" />
              <span className="h-3 w-3 rounded-full bg-coral" />
            </div>
          </div>
          <div className="flex-1 space-y-5 overflow-hidden p-5">
            {messages.map((message) => (
              <div key={message.name} className="flex gap-3">
                <span className={`h-10 w-10 shrink-0 rounded-full ${message.color}`} />
                <div>
                  <p className="text-sm font-bold">{message.name}</p>
                  <p className="mt-1 rounded-xl bg-white/8 px-4 py-3 text-sm leading-6 text-white/76">
                    {message.body}
                  </p>
                </div>
              </div>
            ))}
            <div className="float-fast ml-auto w-48 rounded-2xl bg-white p-3 text-ink shadow-soft">
              <p className="text-xs font-bold text-blurple">Live Call</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="h-16 rounded-xl bg-lagoon" />
                <div className="h-16 rounded-xl bg-coral" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
