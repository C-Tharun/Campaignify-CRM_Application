export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 flex items-center justify-center px-4">
      <main className="w-full max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">Welcome to <span className="text-blue-200">Campaignify</span></h1>
          <p className="text-lg md:text-2xl text-blue-100 mb-8 font-medium">Your intelligent CRM platform for customer segmentation, personalized campaigns, and data-driven insights.</p>
          <a
            href="/auth/signin"
            className="inline-block px-8 py-3 bg-white text-blue-700 font-semibold rounded-full shadow-lg hover:bg-blue-100 transition text-lg"
          >
            Get Started
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/90 rounded-2xl shadow-lg p-8 flex flex-col items-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-blue-800 mb-2">Smart Segmentation</h3>
            <p className="text-blue-700">Create dynamic customer segments using flexible rule logic and AI-powered insights.</p>
          </div>
          <div className="bg-white/90 rounded-2xl shadow-lg p-8 flex flex-col items-center">
            <div className="bg-indigo-100 p-4 rounded-full mb-4">
              <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-indigo-800 mb-2">Campaign Management</h3>
            <p className="text-indigo-700">Design and deliver personalized campaigns with real-time tracking and analytics.</p>
          </div>
          <div className="bg-white/90 rounded-2xl shadow-lg p-8 flex flex-col items-center">
            <div className="bg-purple-100 p-4 rounded-full mb-4">
              <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-purple-800 mb-2">AI-Powered Insights</h3>
            <p className="text-purple-700">Get intelligent recommendations and automated insights to optimize your campaigns.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
