'use client';
import React from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">
          Welcome to Campaignify-XenoCRM
        </h1>
        <div className="bg-white rounded-lg shadow-xl p-6">
          <p className="text-gray-800">
            This is a test component to verify Tailwind CSS is working correctly.
          </p>
          <div className="mt-4 flex gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
              Primary Button
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors">
              Secondary Button
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 