'use client';

import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Lightbulb, FileText, ArrowRight, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: BarChart3,
      title: 'Revenue Analytics',
      description: 'Track daily and monthly revenue trends with beautiful visualizations',
    },
    {
      icon: TrendingUp,
      title: '30-Day Forecasting',
      description: 'Predict future revenue using advanced linear regression models',
    },
    {
      icon: Lightbulb,
      title: 'AI-Powered Insights',
      description: 'Get actionable business recommendations from Gemini 2.5 Flash',
    },
    {
      icon: FileText,
      title: 'Professional Reports',
      description: 'Export comprehensive PDF reports with one click',
    },
  ];

  const benefits = [
    'Upload CSV transaction data in seconds',
    'Automatic anomaly detection for revenue spikes and drops',
    'Product performance ranking and analysis',
    'Business health scoring across 4 key dimensions',
    'Revenue concentration risk assessment',
    'Growth trajectory analysis and forecasting',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center mb-16">
          <button
            type="button"
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LedgerMind AI
            </h1>
          </button>
          
          <p className="text-2xl text-gray-700 mb-4 font-medium">
            Revenue Intelligence Engine for Small Businesses
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your transaction data into actionable insights with AI-powered analytics,
            forecasting, and business intelligence.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.push('/businesses')}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all"
            >
              View Demo
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Everything You Need to Understand Your Business
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business Data?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Upload your transaction data and get instant insights in minutes.
          </p>
          <button
            onClick={() => router.push('/upload')}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all"
          >
            Start Free Analysis
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-sm">
          <p>Built with Next.js 14, TypeScript, Tailwind CSS, and Gemini 2.5 Flash</p>
          <p className="mt-2">© 2024 LedgerMind AI. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
