import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Github,
  GitBranch,
  Globe,
  HeartHandshake,
  Layers,
  ShieldCheck,
  Sparkles,
  Upload,
  Workflow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DonationButton from '@/components/DonationButton';
import { openSourceMessage } from '@/lib/donations';

const pillars = [
  {
    icon: Brain,
    title: 'Personal AI identity',
    text: 'Create an AIFace that learns your tone, goals, files, URLs, FAQs and working style over time.',
  },
  {
    icon: Workflow,
    title: 'Orchestration engine',
    text: 'Behind the single AIFace sits a structured run engine with planning, execution, evaluation and recovery.',
  },
  {
    icon: GitBranch,
    title: 'Specialist agents',
    text: 'Tasks can be decomposed, routed, handed off and reviewed by invisible specialists before one unified answer returns.',
  },
];

const flow = [
  'Train your AIFace with files, URLs and FAQs',
  'SnapTrainer interprets intent and selects a run mode',
  'Specialist agents work through shared state',
  'The AIFace returns one clear, personal result',
];

const features = [
  'All models free to use',
  'Open source and donation supported',
  'Advanced training controls for experts',
  'URL crawling and FAQ training',
  'Structured run state and telemetry',
  'Reviewer/evaluator recovery foundation',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Snap<span className="text-primary">Trainer</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <DonationButton size="sm" className="hidden sm:inline-flex" />
            <Link to="/app">
              <Button variant="ghost" size="sm">Open app</Button>
            </Link>
            <Link to="/create">
              <Button size="sm" className="shadow-lg shadow-primary/20">
                Start
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_36%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.16),transparent_28%)] pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Open source personal AI platform
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.02]">
                  Train one AI identity.
                  <span className="block text-primary">Let a whole agent team work behind it.</span>
                </h1>
                <p className="text-lg text-muted-foreground mt-6 max-w-2xl leading-relaxed">
                  SnapTrainer helps people build a personal AIFace that understands their style, knowledge and goals - while a production-minded orchestration engine handles planning, handoffs, evaluation and recovery behind the scenes.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <Link to="/create">
                    <Button size="lg" className="gap-2 shadow-xl shadow-primary/20">
                      Create your AIFace
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/app">
                    <Button size="lg" variant="outline" className="gap-2">
                      Go to dashboard
                      <Layers className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {['No model paywalls', 'English-only platform', 'Donation supported'].map((item) => (
                    <span key={item} className="rounded-full border border-border/60 bg-card px-3 py-1">
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55, delay: 0.1 }}
              >
                <Card className="relative overflow-hidden border-border/50 bg-card/90 p-5 sm:p-6 shadow-2xl shadow-primary/10">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                  <div className="rounded-2xl border border-border/50 bg-secondary/30 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Brain className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">AIFace run</p>
                          <p className="text-xs text-muted-foreground">plan {'->'} execute {'->'} evaluate</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-1 text-xs font-medium">
                        Ready
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      {[
                        ['Intent', 'Understands the user goal and constraints'],
                        ['State', 'Stores checkpoints and handoffs'],
                        ['Agents', 'Routes subtasks to specialists'],
                        ['Review', 'Scores and recovers before final output'],
                      ].map(([label, text], index) => (
                        <div key={label} className="flex items-start gap-3 rounded-xl bg-background/80 border border-border/50 p-3">
                          <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">{text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid md:grid-cols-3 gap-4">
            {pillars.map((pillar) => (
              <Card key={pillar.title} className="p-5 border-border/50">
                <pillar.icon className="w-6 h-6 text-primary mb-4" />
                <h2 className="font-semibold">{pillar.title}</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{pillar.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1 text-xs font-medium mb-4">
                <Workflow className="w-3.5 h-3.5 text-primary" />
                How it works
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Simple on the surface. Structured underneath.</h2>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Users do not need to become prompt engineers. SnapTrainer turns natural goals into controlled runs with shared state, routing decisions and inspectable execution traces.
              </p>
              <div className="mt-6 space-y-3">
                {flow.map((item, index) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="p-5 border-border/50">
              <h3 className="font-semibold mb-4">Foundation features</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="overflow-hidden border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8">
            <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-center">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Open source. Free to use. Donation supported.</h2>
                  <p className="text-muted-foreground mt-2 max-w-3xl">{openSourceMessage}</p>
                </div>
              </div>
              <DonationButton size="lg" />
            </div>
          </Card>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Upload, title: 'Train with knowledge', text: 'Upload files, crawl URLs and add FAQs so your AIFace learns real context.' },
              { icon: Globe, title: 'Natural interaction', text: 'Write normally. SnapTrainer handles prompt structure, routing and state.' },
              { icon: ShieldCheck, title: 'Built for reliability', text: 'Structured state, validation and recovery make the engine inspectable.' },
            ].map((item) => (
              <Card key={item.title} className="p-5 border-border/50">
                <item.icon className="w-6 h-6 text-primary mb-4" />
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.text}</p>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Build an AI that learns you.</h2>
            <p className="text-muted-foreground mt-3">Start with one AIFace. Let the engine grow with your work.</p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Link to="/create">
                <Button size="lg" className="gap-2 shadow-xl shadow-primary/20">
                  Create AIFace
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="https://github.com/Call-Harbor/SnapTrainer" target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="gap-2">
                  <Github className="w-4 h-4" />
                  View source
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
