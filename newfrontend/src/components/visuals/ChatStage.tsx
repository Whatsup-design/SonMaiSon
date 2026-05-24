const servers = ['S', 'M', 'G', 'D', '+'];
const members = ['sonson', 'milky', 'taj', 'boss'];

export function ChatStage() {
  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div className="aspect-[1.08] rounded-[32px] border border-white/70 bg-[#313338] p-4 shadow-soft md:p-6">
        <div className="grid h-full grid-cols-[52px_150px_1fr] gap-3 overflow-hidden rounded-[22px] bg-[#1E1F22] p-3 text-white md:grid-cols-[64px_190px_1fr]">
          <div className="flex flex-col items-center gap-3">
            {servers.map((server, index) => (
              <div
                key={server}
                className={`grid h-11 w-11 place-items-center rounded-2xl text-sm font-black ${
                  index === 0 ? 'bg-discord' : 'bg-white/10'
                }`}
              >
                {server}
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-[#2B2D31] p-3">
            <div className="mb-4 h-5 w-24 rounded bg-white/15" />
            {['general', 'clips', 'voice-room', 'launch'].map((channel, index) => (
              <div
                key={channel}
                className={`mb-2 rounded-lg px-3 py-2 text-sm font-bold ${
                  index === 0 ? 'bg-white/12 text-white' : 'text-white/55'
                }`}
              >
                # {channel}
              </div>
            ))}
            <div className="mt-5 rounded-xl bg-mint/20 p-3 text-xs font-bold text-mint">
              Voice connected
            </div>
          </div>
          <div className="flex min-w-0 flex-col rounded-2xl bg-[#313338]">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div>
                <div className="text-sm font-black"># general</div>
                <div className="text-xs text-white/45">4 online</div>
              </div>
              <div className="flex gap-2">
                <span className="h-8 w-8 rounded-full bg-white/10" />
                <span className="h-8 w-8 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-hidden p-4">
              {members.map((member, index) => (
                <div key={member} className="flex gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-discord to-mint" />
                  <div className="min-w-0">
                    <div className="text-xs font-black">{member}</div>
                    <div className="mt-1 rounded-2xl bg-white/8 px-3 py-2 text-sm text-white/80">
                      {index === 0 && 'Join the voice room when ready.'}
                      {index === 1 && 'Invite link worked perfectly.'}
                      {index === 2 && 'Video call after the demo?'}
                      {index === 3 && 'Shipping the guild flow now.'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="m-4 rounded-xl bg-[#383A40] px-4 py-3 text-sm text-white/45">
              Message #general
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 left-8 rounded-3xl bg-lemon px-5 py-4 text-sm font-black shadow-soft">
        Live voice, text, and video
      </div>
      <div className="absolute -right-2 top-10 rounded-3xl bg-coral px-5 py-4 text-sm font-black text-white shadow-soft">
        Invite accepted
      </div>
    </div>
  );
}
