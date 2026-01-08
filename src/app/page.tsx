"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/Button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/Card";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Shield, UserCheck, ArrowRight, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-950">
      {/* Background Gradients - Made much lighter */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-indigo-50/50 to-blue-50/50 blur-3xl opacity-60" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                #1 Healthcare Platform 2025
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-6 leading-[1.1]">
                Healthcare <br/>
                <span className="text-indigo-600 dark:text-indigo-400">Reimagined</span>
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Experience the future of medical appointments. Connect with top specialists, manage your health records, and book visits instantly with our AI-powered platform.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/auth?mode=register">
                  <Button size="xl" variant="gradient" className="rounded-full px-8 shadow-none hover:shadow-lg transition-shadow">
                    Start Your Journey
                  </Button>
                </Link>
                <Link href="/doctors">
                  <Button size="xl" variant="outline" className="rounded-full px-8 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
                    Find a Doctor
                  </Button>
                </Link>
              </div>

              <div className="mt-12 flex items-center justify-center lg:justify-start gap-6 text-sm font-medium text-slate-500">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                       <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="Patient" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="flex text-amber-400 gap-0.5">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <span>Trusted by 50k+ patients</span>
                </div>
              </div>
            </div>

            {/* Hero Image - Smaller Size */}
            <div className="flex-1 relative w-full aspect-square lg:aspect-auto lg:h-[500px] max-w-lg mx-auto select-none pointer-events-none">
              <div className="relative w-full h-full rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-sm">
                 {/* Using the generated image moved to public */}
                <Image 
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=1000" 
                  alt="Professional Male Doctor" 
                  fill
                  className="object-cover w-full h-full object-top"
                  priority
                />
                
                {/* Floating Glass Cards - Lighter border */}
                <div className="absolute bottom-6 left-6 p-3 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3 animate-bounce-slow">
                  <div className="h-10 w-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Online</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">120+ Doctors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Centered & Modern */}
      <section className="py-20 bg-white dark:bg-slate-950 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wider uppercase text-lg mb-3">Why Patients Choose Us</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Healthcare that revolves around <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">your needs</span>
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                We've reimagined the doctor-patient relationship to be seamless, transparent, and strictly focused on your well-being.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Feature
                icon={<Calendar className="h-6 w-6 text-white" />}
                title="Instant Availability"
                desc="Browse real-time calendars and book appointments instantly. No phone calls, no waiting on hold."
                color="hover:-translate-y-1"
                iconBg="bg-blue-500 shadow-blue-200"
              />
              <Feature
                icon={<Shield className="h-6 w-6 text-white" />}
                title="Secure & Private"
                desc="Your health data is protected with enterprise-grade encryption and strictly compliant with privacy standards."
                color="hover:-translate-y-1"
                iconBg="bg-indigo-500 shadow-indigo-200"
              />
              <Feature
                 icon={<Star className="h-6 w-6 text-white" />}
                 title="Top-Rated Specialists"
                 desc="Connect with verified doctors who are consistently rated 5-stars by the community."
                 color="hover:-translate-y-1"
                 iconBg="bg-violet-500 shadow-violet-200"
              />
           </div>
        </div>
      </section>

      {/* CTA Section - Deep Blue with 3D feel */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="relative rounded-[2.5rem] bg-indigo-600 overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col items-center justify-center py-24 px-6 text-center">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                Ready to prioritize your health?
              </h2>
              <p className="text-xl text-indigo-100 max-w-2xl mb-12">
                Join thousands of users who have transformed their healthcare journey with DocBook.
              </p>
              <Link href="/auth?mode=register">
                <Button size="xl" variant="primary" className="rounded-full px-12 text-lg bg-white text-indigo-600 hover:bg-slate-50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-0">
                  Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, desc, color, iconBg }: { icon: any, title: string, desc: string, color?: string, iconBg?: string }) {
  return (
    <Card className={cn("shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group border-0 bg-white dark:bg-slate-900/50 dark:hover:bg-slate-900", color)}>
      <CardContent className="p-8">
        <div className={cn("h-14 w-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 shadow-sm", iconBg || "bg-indigo-50 dark:bg-indigo-900/20")}>
          {icon}
        </div>
        <CardTitle className="mb-3 text-slate-900 dark:text-slate-100 font-bold text-xl group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">{desc}</CardDescription>
      </CardContent>
    </Card>
  )
}
