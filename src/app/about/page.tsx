import { Button } from "@/components/Button";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Users, Heart, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative py-24 bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-indigo-50/50 dark:bg-indigo-900/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-6">
              Reimagining Healthcare <span className="text-indigo-600 dark:text-indigo-400">Together</span>.
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              We started DocBook with a simple mission: to bridge the gap between patients and trusted healthcare providers through technology that feels human.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Our Mission</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                To build a healthcare ecosystem where quality care is accessible, transparent, and efficient for everyone. We believe finding a doctor shouldn't be a headache.
              </p>
              <ul className="space-y-4">
                {[
                  "Patient-centric design",
                  "Verified, top-tier specialists",
                  "Secure and private data handling",
                  "Instant, hassle-free booking"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl shadow-indigo-100">
               <img 
                  src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1000" 
                  alt="Our Team" 
                  className="object-cover w-full h-full"
               />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Doctors", value: "10k+", icon: Users },
              { label: "Patients Served", value: "50k+", icon: Heart },
              { label: "Specialties", value: "25+", icon: CheckCircle2 },
              { label: "Safety Score", value: "100%", icon: Shield },
            ].map((stat, i) => (
              <div key={i} className="p-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 mx-auto flex items-center justify-center mb-4 backdrop-blur-sm">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-indigo-200 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-4">
           <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Join our growing community</h2>
           <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
             Whether you're a patient looking for care or a doctor looking to expand your practice, we have a place for you.
           </p>
           <Link href="/auth?mode=register">
             <Button size="xl" className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700">
               Get Started <ArrowRight className="ml-2 h-5 w-5" />
             </Button>
           </Link>
        </div>
      </section>
    </div>
  );
}
