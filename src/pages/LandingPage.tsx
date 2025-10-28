import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Download, FileText, Mail, Users, Clock, Sparkles, Package } from 'lucide-react';
import { Button, Container, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui';

const LandingPage = () => {
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

            {/* Visual - Clean Dashboard Preview */}
            <div className="relative">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-900">Tech Summit 2025</span>
                  <span className="text-xs text-gray-500">stageasset.io/summit-2025</span>
                </div>

                <div className="space-y-3">
                  {/* Submitted speaker */}
                  <div className="bg-white rounded-md p-3 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
                        <div className="h-2 bg-gray-100 rounded w-1/3"></div>
                      </div>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">Submitted</span>
                    </div>
                  </div>

                  {/* Pending speaker */}
                  <div className="bg-white rounded-md p-3 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                        <div className="h-2 bg-gray-100 rounded w-1/4"></div>
                      </div>
                      <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded">Pending</span>
                    </div>
                  </div>

                  {/* Another submitted */}
                  <div className="bg-white rounded-md p-3 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-2 bg-gray-100 rounded w-2/5"></div>
                      </div>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">Submitted</span>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded transition-colors">
                  Download all files
                </button>
              </div>
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

      {/* The Problem */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              You know this pain
            </h2>
            <div className="prose prose-lg">
              <p className="text-gray-700 mb-4">
                Three weeks before your conference. You need files from 50 speakers. Headshots. Bios. Presentation decks.
              </p>
              <p className="text-gray-700 mb-4">
                So you email them. Half respond with the wrong file format. A quarter miss the deadline. Someone sends a 2006 headshot. Another person emails you six versions of their deck at midnight.
              </p>
              <p className="text-gray-900 font-medium">
                You are not an event manager. You are a professional file wrangler.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* How it Works */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 via-emerald-50/20 to-gray-50" id="how-it-works">
        <Container>
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Three steps, zero pain
            </h2>
            <p className="text-lg text-gray-600">
              We built this because we were tired of the same mess.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: '1',
                title: 'Create event',
                description: 'Name it. Set a deadline. Pick what assets you need.',
                detail: 'Takes 30 seconds. No complicated setup.'
              },
              {
                number: '2',
                title: 'Share link',
                description: 'Copy the link. Paste it in your speaker email.',
                detail: 'They upload directly. No login needed.'
              },
              {
                number: '3',
                title: 'Download ZIP',
                description: 'All files organized by speaker. One click.',
                detail: 'We remind the stragglers automatically.'
              }
            ].map((step) => (
              <div key={step.number}>
                <div className="text-4xl font-bold text-emerald-700 mb-3">{step.number}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-700 mb-2">{step.description}</p>
                <p className="text-sm text-gray-500">{step.detail}</p>
              </div>
            ))}
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

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Starter</h3>
              <div className="mt-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">$39</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                {['1 active event', '10 speakers', 'File validation', 'Auto reminders', 'Email support'].map((item) => (
                  <li key={item} className="flex items-start text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="secondary" className="w-full">
                Start trial
              </Button>
            </div>

            {/* Professional */}
            <div className="border-2 border-emerald-700 rounded-lg p-6 bg-white relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-yellow-500 text-slate-900 text-xs font-semibold rounded-full">
                  Most popular
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Professional</h3>
              <div className="mt-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">$99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                {['3 active events', '50 speakers each', 'Branded portal', 'File validation', 'Priority support', 'CSV export'].map((item) => (
                  <li key={item} className="flex items-start text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
                Start trial
              </Button>
            </div>

            {/* Agency */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Agency</h3>
              <div className="mt-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">$249</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                {['Unlimited events', '100 speakers each', 'White-label', 'API access', 'Dedicated support', 'Custom features'].map((item) => (
                  <li key={item} className="flex items-start text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="secondary" className="w-full">
                Contact sales
              </Button>
            </div>
          </div>

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
