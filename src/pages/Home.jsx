import { Link } from "react-router-dom";
import { Cloud, Zap, TrendingDown, BarChart3, ArrowRight } from "lucide-react";
import Header from "../components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-24 md:py-32 max-w-7xl mx-auto w-full">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Design Your Cloud <span className="text-blue-600 dark:text-blue-400">Architecture</span> with AI
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Get AI-powered recommendations for multi-cloud architectures optimized for cost, performance, and reliability. Plan, migrate, and optimize your infrastructure with confidence.
            </p>
            <Link
              to="/design"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Start Designing
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white dark:bg-gray-800 py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
              Comprehensive Cloud Planning
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Cloud className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
                title="Design Architecture"
                description="Get AI-recommended cloud architectures tailored to your requirements"
              />
              <FeatureCard
                icon={<TrendingDown className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
                title="Cost Optimization"
                description="Compare pricing across AWS, Azure, and Google Cloud"
              />
              <FeatureCard
                icon={<Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
                title="Performance Planning"
                description="Resource recommendations with WAF patterns and reliability metrics"
              />
              <FeatureCard
                icon={<BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
                title="Visual Architecture"
                description="See your infrastructure design with Mermaid diagrams"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold mb-4 text-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select Template</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose between Design, Migrate, Optimize, or Compare templates
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold mb-4 text-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Describe Requirements</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Tell us about your application, scale, and constraints
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold mb-4 text-lg">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Get Recommendations</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receive AI-powered architectures with costs and implementation steps
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 text-white px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to optimize your cloud infrastructure?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Get started with AI-powered cloud architecture recommendations in minutes.
            </p>
            <Link
              to="/design"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Design Your Architecture
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 CloudOptimal.ai. Powered by Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
