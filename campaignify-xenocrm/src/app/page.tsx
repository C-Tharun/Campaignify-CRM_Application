import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700">
      {/* Header */}
      <header className="w-full bg-white/90 shadow-md py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/favicon.ico" alt="Campaignify Logo" width={36} height={36} className="rounded" />
          <span className="text-2xl font-bold text-blue-800 tracking-tight">Campaignify</span>
        </div>
        <a
          href="/auth/signin"
          className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow hover:from-blue-700 hover:to-purple-700 transition"
        >
          Sign In
        </a>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative">
        {/* Decorative background shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-blue-400 opacity-20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-400 opacity-20 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            Supercharge Your <span className="text-blue-200">Campaigns</span> & CRM
          </h1>
          <p className="text-lg md:text-2xl text-blue-100 mb-8 font-medium max-w-2xl mx-auto">
            Campaignify helps you segment customers, launch personalized campaigns, and manage your data with ease—all in one modern dashboard.
          </p>
          <a
            href="/auth/signin"
            className="inline-block px-8 py-3 bg-white text-blue-700 font-semibold rounded-full shadow-lg hover:bg-blue-100 transition text-lg"
          >
            Get Started
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:shadow-2xl transition-shadow border border-blue-100">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-blue-800 mb-2">Smart Segmentation</h3>
            <p className="text-blue-700 text-center text-sm">Create dynamic customer segments using flexible rule logic and AI-powered insights.</p>
          </div>
          {/* Feature 2 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:shadow-2xl transition-shadow border border-indigo-100">
            <div className="bg-indigo-100 p-4 rounded-full mb-4">
              <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-indigo-800 mb-2">Campaign Management</h3>
            <p className="text-indigo-700 text-center text-sm">Design and deliver personalized campaigns with real-time tracking and analytics.</p>
          </div>
          {/* Feature 3 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:shadow-2xl transition-shadow border border-purple-100">
            <div className="bg-purple-100 p-4 rounded-full mb-4">
              <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-purple-800 mb-2">Data Import & Management</h3>
            <p className="text-purple-700 text-center text-sm">Easily import customer and order data via CSV, manage segments and campaigns, and track recent activity in a modern dashboard.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
