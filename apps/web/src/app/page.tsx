import React from 'react';
import { Hero } from '../components/home/hero';
import { CategorySection } from '../components/home/category-section';
import { FeaturedEvents } from '../components/home/featured-events';
import { ValueSection } from '../components/home/value-section';
import { CTASection } from '../components/home/cta-section';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1">
        <Hero />
        <CategorySection />
        <FeaturedEvents />
        <ValueSection />
        <CTASection />
      </main>
    </div>
  );
}
