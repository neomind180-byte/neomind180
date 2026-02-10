import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          {/* Exact 60x60 Resize */}
          <div className="w-[60px] h-[60px] relative">
            <Image 
              src="/business-logo.png" 
              alt="NeoMind180 Logo" 
              width={60} 
              height={60} 
              className="object-contain" 
              priority 
            />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black text-[#00538e] leading-[1.1] tracking-tighter uppercase">
            Rethink. Rewire.<br />Renew.
          </h1>
          
          <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
            Move from overthinking to clarity. AI-powered coaching that helps you become a calm, confident observer of your thoughts.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register" className="px-10 py-5 bg-[#00538e] text-white rounded-full font-bold text-lg text-center hover:shadow-xl transition-all">
              Start Free
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/5] relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
            <Image src="/hero-woman.jpg" alt="Serene woman reflecting" fill className="object-cover" />
          </div>
        </div>
      </section>
    </div>
  );
}