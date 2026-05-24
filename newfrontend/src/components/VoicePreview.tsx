type Props = {
  variant: 'chat' | 'voice' | 'stage';
};

const names = ['Sonson', 'Sun', 'Boss', 'Sita'];

export function VoicePreview({ variant }: Props) {
  if (variant === 'chat') {
    return (
      <div className="rounded-[28px] bg-white p-5 shadow-soft ring-1 ring-ink/5">
        <div className="grid gap-4 sm:grid-cols-2">
          {['Product squad', 'Study room', 'Game night', 'Design review'].map((room, index) => (
            <div key={room} className="rounded-2xl bg-[#f0f2ff] p-5">
              <div className={`mb-8 h-20 rounded-2xl ${index % 2 ? 'bg-coral' : 'bg-blurple'}`} />
              <p className="font-black">{room}</p>
              <p className="mt-1 text-sm text-ink/58">{index + 3} members online</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'voice') {
    return (
      <div className="rounded-[28px] bg-[#232638] p-5 shadow-glow ring-1 ring-white/10">
        <div className="rounded-3xl bg-[#151722] p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-lagoon">Voice Room</p>
              <h3 className="mt-1 text-2xl font-black">general lounge</h3>
            </div>
            <span className="rounded-full bg-lagoon px-4 py-2 text-xs font-black text-ink">LIVE</span>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {names.map((name, index) => (
              <div key={name} className="rounded-2xl bg-white/8 p-4">
                <div className={`h-16 rounded-2xl ${index % 2 ? 'bg-honey' : 'bg-blurple'}`} />
                <p className="mt-3 font-bold">{name}</p>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className={`h-2 rounded-full ${index === 0 ? 'w-4/5 bg-lagoon' : 'w-2/5 bg-white/24'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] bg-[#181a28] p-4 shadow-soft">
      <div className="aspect-video rounded-3xl bg-gradient-to-br from-blurple via-lagoon to-honey p-5">
        <div className="h-full rounded-2xl bg-white/18 p-4 backdrop-blur">
          <div className="h-2/3 rounded-2xl bg-white/40" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            <span className="h-16 rounded-2xl bg-white/32" />
            <span className="h-16 rounded-2xl bg-white/54" />
            <span className="h-16 rounded-2xl bg-white/32" />
          </div>
        </div>
      </div>
    </div>
  );
}
