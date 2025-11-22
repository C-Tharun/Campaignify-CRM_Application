'use client';
import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
              Campaignify-XenoCRM
            </h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
              Streamline your marketing campaigns and customer relationships with our powerful CRM solution
            </p>
            <div className="mt-10">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Powerful Features</h2>
            <p className="mt-4 text-lg text-gray-600">Everything you need to manage your campaigns effectively</p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                title: 'Campaign Management',
                description: 'Create, track, and optimize your marketing campaigns with ease',
                icon: '📊'
              },
              {
                title: 'Customer Insights',
                description: 'Gain valuable insights into your customer behavior and preferences',
                icon: '🎯'
              },
              {
                title: 'Automated Workflows',
                description: 'Streamline your processes with intelligent automation',
                icon: '⚡'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Import & Management Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="mb-8 lg:mb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Import & Management</h2>
              <p className="text-lg text-gray-600 mb-6">
                Seamlessly import your customer and order data via CSV, manage dynamic segments, and launch targeted campaigns—all from a modern, intuitive dashboard.
              </p>
              <ul className="space-y-4">
                {[
                  'CSV import for customers and orders',
                  'Quick actions: create campaigns and segments',
                  'Recent activity feed for real-time updates',
                  'Secure Google authentication and user management',
                  'Customizable segmentation rules',
                  'Campaign analytics and reporting',
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-lg p-8 shadow-xl">
                <div className="text-white">
                  <h3 className="text-2xl font-semibold mb-4">Import & Manage</h3>
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Customers Imported</span>
                        <span className="text-sm">+1,200</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full">
                        <div className="h-2 bg-white rounded-full w-4/5"></div>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Orders Imported</span>
                        <span className="text-sm">+3,400</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full">
                        <div className="h-2 bg-white rounded-full w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Trusted by Industry Leaders</h2>
            <p className="mt-4 text-lg text-gray-600">See what our customers have to say</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "Campaignify-XenoCRM has transformed how we manage our marketing campaigns. The AI insights are invaluable.",
                author: "Sarah Johnson",
                role: "Marketing Director"
              },
              {
                quote: "The automated workflows have saved us countless hours. A game-changer for our team.",
                author: "Michael Chen",
                role: "Digital Marketing Manager"
              },
              {
                quote: "The customer insights feature has helped us understand our audience better than ever before.",
                author: "Emily Rodriguez",
                role: "Growth Strategist"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                <div className="font-semibold text-gray-900">{testimonial.author}</div>
                <div className="text-gray-500">{testimonial.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to Get Started?</h2>
          <p className="mt-4 text-lg text-gray-600">Join thousands of businesses already using Campaignify-XenoCRM</p>
          <div className="mt-8">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
} 