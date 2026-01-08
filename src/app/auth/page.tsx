"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ArrowRight, Loader2, AlertCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";
type UserRole = "patient" | "doctor";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<UserRole>("patient");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // Doctor specific fields
  const [specialization, setSpecialization] = useState("");
  const [customSpecialization, setCustomSpecialization] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [experience, setExperience] = useState("");
  
  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError(null);
    setNotice(null);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    setNotice(null);

    // Validate passwords match for registration
    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      if (mode === "register") {
        const fullName = `${firstName} ${lastName}`.trim();
        
        // 1. Sign up user
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
              ...(role === 'doctor' ? {
                specialization: specialization === 'other' ? customSpecialization : specialization,
                license_number: licenseNumber,
                experience_years: experience
              } : {})
            }
          }
        });

        if (signUpError) {
          const status = (signUpError as any)?.status;
          const message = (signUpError as any)?.message || "";

          if (status === 429) {
            setError(message || "Too many attempts. Please wait a moment and try again.");
            return;
          }

          if (message.toLowerCase().includes("already registered")) {
            setMode("login");
            setError("An account with this email already exists. Please log in instead.");
            return;
          }

          throw signUpError;
        }

        if (!data.user) {
          throw new Error("Account was created but user data is missing. Please try logging in.");
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: data.user.id,
              email: email,
              role: role,
              full_name: fullName,
            },
            { onConflict: 'id' }
          );

        if (profileError) {
          const status = (profileError as any)?.status;
          if (status !== 409) {
            console.error("Profile creation failed:", profileError);
            throw new Error("Failed to create user profile. Please try again.");
          }
        }

        // Redirect user immediately after successful sign-up
        router.push(role === 'patient' ? '/patient' : '/doctor');

      } else {
        // Login
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          const status = (signInError as any)?.status;
          const message = (signInError as any)?.message || "";

          if (status === 400 && message.toLowerCase().includes("invalid login credentials")) {
            setError("Invalid email or password.");
            return;
          }

          if (status === 429) {
            setError(message || "Too many attempts. Please wait a moment and try again.");
            return;
          }

          throw signInError;
        }

        if (data.user) {
          // Fetch role to redirect correctly
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();

          const userRole =
            (profile?.role as UserRole | undefined) ||
            (data.user.user_metadata?.role as UserRole | undefined) ||
            role;
          router.push(userRole === 'patient' ? '/patient' : '/doctor');
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  const isRegister = mode === "register";

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-slate-950">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 border-r border-slate-200">
         <div className="absolute inset-0 bg-indigo-600/20 mix-blend-multiply z-10" />
         {/* Unsplash image for auth side panel */}
         <img 
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070" 
            alt="Medical Team"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
         />
         <div className="relative z-20 flex flex-col justify-between h-full p-12 text-white">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xl">D</div>
              <span className="text-xl font-bold tracking-tight">DocBook.</span>
            </div>
            
            <div className="max-w-md">
               <h2 className="text-4xl font-bold mb-6 leading-tight">
                 "The most efficient way to manage your healthcare journey."
               </h2>
               <div className="flex gap-4 mb-8">
                  <div className="flex -space-x-3">
                     {[
                       "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150",
                       "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150",
                       "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150",
                       "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=150",
                       "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150"
                     ].map((src, i) => (
                       <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden relative ring-2 ring-slate-900">
                          <img src={src} alt="Doctor" className="h-full w-full object-cover" />
                       </div>
                     ))}
                  </div>
                  <div className="flex flex-col justify-center">
                     <p className="font-semibold text-sm">Join 10,000+ Doctors</p>
                     <p className="text-xs text-slate-300">and Patients today.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-12 lg:p-24 bg-slate-50/50 dark:bg-slate-900">
        <div className="w-full max-w-md space-y-8 animate-in slide-in-from-right-8 duration-700">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {isRegister ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {isRegister 
                ? "Start your healthcare journey with us today." 
                : "Please enter your details to access your dashboard."}
            </p>
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-fit mx-auto lg:mx-0">
             <button
               type="button"
               onClick={() => setRole("patient")}
               className={cn(
                 "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                 role === "patient" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
               )}
             >
               Patient
             </button>
             <button
               type="button"
               onClick={() => setRole("doctor")}
               className={cn(
                 "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                 role === "doctor" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
               )}
             >
               Doctor
             </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-2 border border-red-100 dark:border-red-900/30">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {notice && (
              <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-sm flex items-start gap-2 border border-indigo-100 dark:border-indigo-900/30">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{notice}</p>
              </div>
            )}

            <div className="space-y-4">
              {isRegister && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      id="fname" 
                      placeholder="First Name" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required={isRegister}
                    />
                    <Input 
                      id="lname" 
                      placeholder="Last Name" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required={isRegister}
                    />
                  </div>
              )}

              {/* Doctor Verification Section */}
              {isRegister && role === "doctor" && (
                <div className="rounded-xl border border-indigo-100 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10 p-4 space-y-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                      <Shield className="h-3 w-3" />
                    </div>
                    <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Professional Verification</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Medical Specialization</label>
                      <select 
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        required={role === "doctor"}
                      >
                        <option value="" disabled>Select your field</option>
                        <option value="cardiology">Cardiology</option>
                        <option value="neurology">Neurology</option>
                        <option value="orthopedics">Orthopedics</option>
                        <option value="pediatrics">Pediatrics</option>
                        <option value="general">General Practice</option>
                        <option value="dermatology">Dermatology</option>
                        <option value="psychiatry">Psychiatry</option>
                        <option value="other">Other</option>
                      </select>
                      
                        {specialization === "other" && (
                        <Input
                          id="customSpec"
                          placeholder="Please specify your specialization"
                          className="mt-2 bg-white dark:bg-slate-800 dark:border-slate-700 animate-in slide-in-from-top-1"
                          required={role === "doctor" && specialization === "other"}
                          value={customSpecialization}
                          onChange={(e) => setCustomSpecialization(e.target.value)}
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input 
                        id="license" 
                        placeholder="License #" 
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        required={role === "doctor"}
                        className="bg-white dark:bg-slate-800 dark:border-slate-700"
                      />
                      <Input 
                        id="experience" 
                        type="number"
                        placeholder="Yrs Experience" 
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        required={role === "doctor"}
                        min="0"
                        className="bg-white dark:bg-slate-800 dark:border-slate-700"
                      />
                    </div>
                  </div>
                </div>
              )}
              <Input
                id="email"
                type="email"
                label="Email address"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              {isRegister && (
                <Input
                  id="confirmPassword"
                  type="password"
                  label="Confirm Password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={isRegister}
                  disabled={isLoading}
                />
              )}
            </div>

            <Button size="lg" className="w-full mt-2" type="submit" disabled={isLoading} variant="gradient">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRegister ? "Create Account" : "Sign In"} {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <button 
              type="button"
              onClick={toggleMode} 
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline transition-all"
            >
              {isRegister ? "Log in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
