import type { FeatureSectionContent } from '../data/content';

type FeatureSectionProps = {
  section: FeatureSectionContent;
  flip?: boolean;
};

const accentClasses = {
  mint: 'bg-mint',
  lemon: 'bg-lemon',
  coral: 'bg-coral',
  discord: 'bg-discord text-white',
};

export function FeatureSection({ section, flip = false }: FeatureSectionProps) {
  return (
    <section id="features" className="bg-white px-4 py-16 md:py-24">
      <div
        className={`mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 ${
          flip ? 'lg:[&>div:first-child]:order-2' : ''
        }`}
      >
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-discord">
            {section.eyebrow}
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            {section.title}
          </h2>
          <p className="mt-5 max-w-xl text-lg font-medium leading-8 text-ink/65">
            {section.body}
          </p>
        </div>
        <div className="rounded-[28px] bg-bloom p-4 shadow-soft md:p-7">
          <div className="rounded-[22px] bg-[#2B2D31] p-5 text-white">
            <div className="mb-5 flex items-center gap-3">
              <div className={`h-12 w-12 rounded-2xl ${accentClasses[section.accent]}`} />
              <div>
                <div className="text-sm font-black">sonmaison-server</div>
                <div className="text-xs text-white/45">community preview</div>
              </div>
            </div>
            <div className="space-y-3">
              {section.messages.map((message, index) => (
                <div key={message} className="rounded-2xl bg-white/8 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${accentClasses[section.accent]}`} />
                    <span className="text-xs font-black text-white/55">member {index + 1}</span>
                  </div>
                  <p className="text-base font-bold">{message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
