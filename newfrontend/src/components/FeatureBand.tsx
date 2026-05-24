import type { FeatureSection } from '../types';
import { VoicePreview } from './VoicePreview';

type Props = {
  section: FeatureSection;
  index: number;
};

const toneClass = {
  light: 'bg-cloud text-ink',
  dark: 'bg-[#171923] text-white',
  mint: 'bg-[#dff7ef] text-ink',
};

export function FeatureBand({ section, index }: Props) {
  const reverse = index % 2 === 1;

  return (
    <article id={section.preview === 'chat' ? 'chat' : section.preview === 'voice' ? 'voice' : 'community'} className={`${toneClass[section.tone]} py-20 sm:py-28`}>
      <div
        className={`mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center ${
          reverse ? 'lg:[&>*:first-child]:order-2' : ''
        }`}
      >
        <div>
          <p className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-blurple">
            {section.stat} {section.statLabel}
          </p>
          <h2 className="max-w-xl text-4xl font-black leading-tight sm:text-5xl">{section.title}</h2>
          <p className={`mt-6 max-w-xl text-lg leading-8 ${section.tone === 'dark' ? 'text-white/72' : 'text-ink/68'}`}>
            {section.body}
          </p>
        </div>
        <VoicePreview variant={section.preview} />
      </div>
    </article>
  );
}
