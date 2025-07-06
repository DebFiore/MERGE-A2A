import Link from 'next/link'
import { Bot, ArrowRight, Phone, FileText, Target } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">MERGE AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="btn-secondary">
                Sign In
              </Link>
              <Link href="/login" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <div className="relative overflow-hidden bg-white">
          <div className="pb-80 pt-16 sm:pb-40 sm:pt-24 lg:pb-48 lg:pt-40">
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  AI Agent to Agent
                  <span className="text-blue-600"> Lead Generation</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
                  Automate your educational lead generation with our AI-powered platform. 
                  From voice confirmation to form submission - completely automated.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link href="/login" className="btn-primary">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <button className="btn-secondary">
                    Watch Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Complete Lead Generation Workflow
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                From CSV upload to final submission - our AI agents handle every step automatically.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <Phone className="h-5 w-5 flex-none text-blue-600" />
                    AI Voice Confirmation
                  </div>
                  <p className="mt-4 text-base leading-7 text-gray-600">
                    Our AI voice agent calls each lead to confirm data and obtain TCPA consent automatically.
                  </p>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <FileText className="h-5 w-5 flex-none text-blue-600" />
                    Automated Submission
                  </div>
                  <p className="mt-4 text-base leading-7 text-gray-600">
                    Playwright automation handles complex form submissions with 90%+ success rate.
                  </p>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <Target className="h-5 w-5 flex-none text-blue-600" />
                    Real-Time Analytics
                  </div>
                  <p className="mt-4 text-base leading-7 text-gray-600">
                    Live dashboards showing lead progression and conversion rates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}