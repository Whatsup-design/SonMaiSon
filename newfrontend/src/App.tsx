import { DownloadCTA } from './components/DownloadCTA';
import { FeatureBand } from './components/FeatureBand';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { featureSections } from './data/sections';

export default function App() {
  return (
    <main className="min-h-screen overflow-hidden bg-cloud text-ink">
      <Navbar />
      <Hero />
      <section className="space-y-0">
        {featureSections.map((section, index) => (
          <FeatureBand key={section.title} section={section} index={index} />
        ))}
      </section>
      <DownloadCTA />
    </main>
  );
}
