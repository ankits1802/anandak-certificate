
import { candidatesData, statsData } from '@/data/candidates';
import { CandidateDashboardClient } from '@/components/CandidateDashboardClient';
import AnandakLogo from '@/components/AnandakLogo';
import IitKgpLogo from '@/components/IitKgpLogo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anandak Certificate Downloader',
  description: 'Generate and download certificates for the Anandak Assessment.',
};

export default async function Home() {
  const currentCandidates = candidatesData;
  const currentStats = statsData;

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 sm:p-6 flex justify-between items-center gap-4">
        <AnandakLogo />
        <IitKgpLogo />
      </header>
      
      <div className="text-center my-4 sm:my-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary">
          Anandak Certificate Downloader
        </h1>
        <p className="text-2xl sm:text-3xl font-semibold text-foreground mt-2">
          आनंदक प्रमाणपत्र डाउनलोडर
        </p>
      </div>

      <CandidateDashboardClient 
        initialCandidates={currentCandidates} 
        initialStats={currentStats} 
      />
    </div>
  );
}
