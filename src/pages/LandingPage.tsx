import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Download, FileText, Mail, Users, Clock, Sparkles, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Container, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { subscriptionPlansService } from '../services/subscription-plans.service';

const LandingPage = () => {
  const { loginWithGoogle } = useAuth();

  // Fetch subscription plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans', 'public'],
    queryFn: () => subscriptionPlansService.getPublicPlans(),
    retry: false, // Don't retry on public pages
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Cloudy Blur Background */}
      <div className="relative overflow-hidden">
        {/* Cloudy Blur Overlay Background - Green & Gold */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {/* Green blob - top left */}
          <div className="absolute top-0 -left-20 w-96 h-96 bg-emerald-400/60 rounded-full blur-3xl"></div>
          {/* Gold blob - top right */}
          <div className="absolute top-20 right-0 w-80 h-80 bg-yellow-400/50 rounded-full blur-3xl"></div>
          {/* Green blob - center */}
          <div className="absolute top-40 left-1/3 w-72 h-72 bg-emerald-300/50 rounded-full blur-3xl"></div>
          {/* Gold blob - center right */}
          <div className="absolute top-60 right-1/4 w-64 h-64 bg-yellow-300/45 rounded-full blur-3xl"></div>
        </div>

        {/* Simple Navigation - Transparent */}
        <nav className="bg-transparent relative z-10">
          <Container>
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-lg font-semibold text-gray-900">StageAsset</span>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
                <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Help</a>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loginWithGoogle}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-sm text-gray-700">Google</span>
                </button>
                <a href="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</a>
                <a href="/register">
                  <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    Try for free
                  </Button>
                </a>
              </div>
            </div>
          </Container>
        </nav>

        {/* Hero - Balanced Layout */}
        <section className="py-16 md:py-20 relative z-10">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Collect event assets without the email chaos
              </h1>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Send one link. Your speakers upload their headshots, bios, and slides. You download everything in a ZIP. No more email archaeology.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <a href="/register">
                  <Button size="lg" className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    Create your event
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </a>
                <a href="#how-it-works">
                  <Button size="lg" variant="secondary">
                    See how it works
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-5 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  14 days free
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  No credit card
                </span>
              </div>
            </div>

            {/* Visual - Realistic Dashboard Preview */}
            <div className="relative">
              {/* Browser Chrome */}
              <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
                {/* Browser Header */}
                <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-500 ml-2">
                    stageasset.io/tech-summit-2025
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="bg-gray-50 p-6">
                  {/* Event Header */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg"></div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900">Tech Summit 2025</h3>
                        <p className="text-xs text-gray-500">Deadline: Dec 15, 2024</p>
                      </div>
                      <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg">
                        <Download className="w-3 h-3 inline mr-1" />
                        Download All
                      </button>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="text-2xl font-bold text-gray-900">24</div>
                      <div className="text-xs text-gray-500">Speakers</div>
                    </div>
                    <div className="bg-white border border-emerald-200 rounded-lg p-3">
                      <div className="text-2xl font-bold text-emerald-700">18</div>
                      <div className="text-xs text-emerald-600">Submitted</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="text-2xl font-bold text-gray-900">72</div>
                      <div className="text-xs text-gray-500">Files</div>
                    </div>
                  </div>

                  {/* Speaker List */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <h4 className="text-xs font-semibold text-gray-700">SPEAKERS</h4>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {/* Speaker 1 - Submitted */}
                      <div className="px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full"></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">Sarah Chen</div>
                          <div className="text-xs text-gray-500">sarah@techcorp.com</div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
                          ✓ Complete
                        </span>
                      </div>
                      {/* Speaker 2 - Submitted */}
                      <div className="px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full"></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">Michael Rodriguez</div>
                          <div className="text-xs text-gray-500">m.rodriguez@startup.io</div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
                          ✓ Complete
                        </span>
                      </div>
                      {/* Speaker 3 - Pending */}
                      <div className="px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full"></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">Jennifer Park</div>
                          <div className="text-xs text-gray-500">jennifer@designco.com</div>
                        </div>
                        <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs font-medium rounded">
                          ⏱ Pending
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">Sarah Chen just submitted</p>
                    <p className="text-xs text-gray-500">Headshot, Bio, Slides</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </Container>
      </section>
      </div>

      {/* Social Proof */}
      <section className="py-12 border-y border-gray-100 bg-slate-900">
        <Container>
          <p className="text-center text-xs text-gray-400 mb-6">Used by event teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-40">
            {['TechConf', 'SummitPro', 'EventCorp', 'MeetupHub'].map((company) => (
              <div key={company} className="text-lg font-semibold text-gray-300">{company}</div>
            ))}
          </div>
        </Container>
      </section>

      {/* The Problem - Two Column Layout */}
      <section className="py-12 md:py-16 bg-gray-50">
        <Container>
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Left: Problem Copy */}
            <div>
              <div className="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full mb-3 uppercase tracking-wide">
                The Problem
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Your inbox is not a file management system
              </h2>
              <div className="space-y-3 text-base text-gray-700 leading-relaxed">
                <p>
                  Three weeks before your conference. You need files from 50 speakers: headshots, bios, presentation decks.
                </p>
                <p className="font-medium text-gray-900">
                  So you email them. Then the chaos begins:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>Half respond with the wrong file format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>A quarter ghost you until the day before</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>Someone sends a pixelated 2006 headshot</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>Another emails six versions: "FINAL_FINAL_v3.pptx"</span>
                  </li>
                </ul>
                <p className="pt-3 text-gray-900 font-semibold border-t border-gray-200">
                  Your inbox becomes an archaeological dig through 200+ messages.
                </p>
                <p className="text-gray-600">
                  You're not an event manager. <span className="text-gray-900 font-medium">You're a file wrangler.</span>
                </p>
              </div>
            </div>

            {/* Right: Before/After Visual */}
            <div className="space-y-4">
              {/* BEFORE - Email Chaos */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded uppercase">Before</span>
                  <span className="text-xs text-gray-500">Email chaos</span>
                </div>
                <div className="bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden">
                  {/* Email Client Mockup */}
                  <div className="bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center gap-2">
                    <Mail className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-600 font-medium">Inbox (247)</span>
                  </div>
                  <div className="divide-y divide-gray-100 bg-white">
                    {[
                      { subject: 'Re: Re: Re: Headshot - UPDATED', time: '11:47 PM', status: 'unread' },
                      { subject: 'FINAL_bio_v3_USE_THIS.docx', time: 'Yesterday', status: 'unread' },
                      { subject: 'Quick question about file format', time: '2 days ago', status: 'unread' },
                    ].map((email, i) => (
                      <div key={i} className={`px-3 py-2 ${email.status === 'unread' ? 'bg-gray-50' : 'bg-white'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs flex-1 truncate ${email.status === 'unread' ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                            {email.subject}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">{email.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-100 px-3 py-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      18 speakers haven't responded. 12 wrong formats.
                    </p>
                  </div>
                </div>
              </div>

              {/* AFTER - StageAsset Dashboard */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded uppercase">After</span>
                  <span className="text-xs text-gray-500">One dashboard</span>
                </div>
                <div className="bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900">Tech Summit 2025</h4>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs font-semibold rounded">
                        42/50
                      </span>
                    </div>
                  </div>
                  <div className="p-3 space-y-2 bg-white">
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs text-gray-900">Sarah Chen</span>
                      </div>
                      <span className="text-xs text-emerald-600 font-medium">Complete</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs text-gray-900">Michael Rodriguez</span>
                      </div>
                      <span className="text-xs text-emerald-600 font-medium">Complete</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">Jennifer Park</span>
                      </div>
                      <span className="text-xs text-gray-500">Pending</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
                    <button className="w-full py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700 transition-colors cursor-pointer">
                      <Download className="w-3 h-3 inline mr-1" />
                      Download All (126 files)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* How it Works */}
      <section className="py-16 md:py-20 bg-white" id="how-it-works">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Three steps. Zero chaos.
            </h2>
            <p className="text-lg text-gray-600">
              We built this because we were tired of the same mess every event.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
                Step 1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Create your event in 30 seconds</h3>
              <p className="text-lg text-gray-700 mb-4">
                Name it. Set a deadline. Pick what you need—headshots, bios, slides, whatever.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Choose from preset requirements or create custom ones</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Set file format rules and size limits automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Add your logo to make it look professional</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-gray-50 rounded-xl p-8 border border-gray-200">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Create Event</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Event Name</label>
                    <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-900">
                      Tech Summit 2025
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Deadline</label>
                    <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-900">
                      December 15, 2024
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-2">Required Assets</label>
                    <div className="space-y-2">
                      {['Headshot', 'Bio', 'Presentation Slides'].map((asset) => (
                        <div key={asset} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm text-gray-900">{asset}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="order-2 lg:order-1">
              {/* Speaker Portal Preview */}
              <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg"></div>
                    <div>
                      <h4 className="font-bold">Tech Summit 2025</h4>
                      <p className="text-sm text-emerald-100">Asset Submission Portal</p>
                    </div>
                  </div>
                  <p className="text-sm text-emerald-50">
                    Hi Sarah! Please upload your speaker materials below.
                  </p>
                </div>
                <div className="p-6 bg-gray-50">
                  <div className="space-y-4">
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900 mb-1">Headshot</p>
                      <p className="text-xs text-gray-500 mb-3">JPG or PNG, min 800x800px</p>
                      <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-emerald-700 transition-colors">
                        Choose File
                      </button>
                    </div>
                    <div className="bg-white border-2 border-emerald-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Bio (uploaded)</p>
                          <p className="text-xs text-gray-500">sarah-bio.pdf • 245 KB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
                Step 2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Share one link. That's it.</h3>
              <p className="text-lg text-gray-700 mb-4">
                Copy the link, paste it in your speaker invitation email. They click, upload, done.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>No account creation required for speakers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Mobile-friendly upload from any device</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Files validated automatically against your requirements</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
                Step 3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Download everything in one click</h3>
              <p className="text-lg text-gray-700 mb-4">
                All files, organized by speaker name, in a single ZIP file. No more hunting through email attachments.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Automatic reminders sent to speakers who haven't submitted</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Real-time dashboard shows exactly who's pending</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Version tracking if speakers update their files</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl p-8 border border-gray-200">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Assets Ready</h4>
                    <p className="text-xs text-gray-500">18 of 24 speakers submitted</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">75%</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>18/24</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <button className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  <Download className="w-4 h-4" />
                  Download All Files (72 files, 145 MB)
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Files organized: /Sarah_Chen/, /Michael_Rodriguez/, ...
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20" id="features">
        <Container>
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Everything you need
            </h2>
            <p className="text-lg text-gray-600">
              Built for real event workflows, not generic form collection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: 'No login for speakers',
                description: 'One link. They upload. Done. No passwords to forget.'
              },
              {
                icon: Mail,
                title: 'Automatic reminders',
                description: 'We politely nudge people who have not submitted yet.'
              },
              {
                icon: Download,
                title: 'One-click download',
                description: 'All files in a ZIP, organized by speaker name.'
              },
              {
                icon: Sparkles,
                title: 'Branded portal',
                description: 'Add your logo and color. Looks like your event.',
                badge: 'New'
              },
              {
                icon: Clock,
                title: 'Real-time status',
                description: 'See who submitted, who is pending, who is late.'
              },
              {
                icon: FileText,
                title: 'File validation',
                description: 'Check dimensions, file types, sizes automatically.'
              }
            ].map((feature, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-5 hover:border-emerald-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-semibold text-gray-900">{feature.title}</h3>
                  {feature.badge && (
                    <span className="px-2 py-0.5 bg-slate-900 text-white text-xs font-semibold rounded">
                      {feature.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-yellow-50/30 via-emerald-50/20 to-gray-50" id="pricing">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Straightforward pricing
            </h2>
            <p className="text-lg text-gray-600">
              All plans include 14-day free trial. No credit card required.
            </p>
          </div>

          {plansLoading ? (
            <div className="text-center py-12 text-gray-600">Loading plans...</div>
          ) : plans && plans.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .map((plan) => (
                  <div
                    key={plan.id}
                    className={`rounded-lg p-6 bg-white relative ${
                      plan.isPopular
                        ? 'border-2 border-emerald-700'
                        : 'border border-gray-200'
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-1 bg-yellow-500 text-slate-900 text-xs font-semibold rounded-full">
                          Most popular
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.name}</h3>
                    <div className="mt-3 mb-4">
                      <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600">/{plan.billingInterval === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                    <ul className="space-y-2 mb-6 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.isPopular ? 'default' : 'secondary'}
                      className={
                        plan.isPopular
                          ? 'w-full bg-emerald-700 hover:bg-emerald-800 text-white'
                          : 'w-full'
                      }
                    >
                      {plan.ctaText || (plan.ctaAction === 'contact' ? 'Contact sales' : 'Start trial')}
                    </Button>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">No plans available at the moment.</div>
          )}

          <p className="text-center text-sm text-gray-500 mt-8">
            Need something custom? <a href="#" className="text-emerald-700 hover:underline font-medium">Get in touch</a>
          </p>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Try it free for 14 days
            </h2>
            <p className="text-lg text-emerald-50 mb-6">
              See if it saves you time. No credit card needed to start.
            </p>
            <a href="/register">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50">
                Create your first event
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900">
        <Container>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
                  <FileText className="w-4 h-4 text-slate-900" />
                </div>
                <span className="font-semibold text-white">StageAsset</span>
              </div>
              <p className="text-sm text-gray-400">
                Collect event assets without the chaos.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Updates</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 StageAsset. Built for event organizers.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;
