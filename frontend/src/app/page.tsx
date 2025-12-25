import Link from 'next/link';
import { Sparkles, ArrowRight, Globe, Palette, Upload, Shield, Zap, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Porty</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="btn-ghost">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary text-sm py-2">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Launch your portfolio in minutes
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Create Stunning</span>
              <br />
              Portfolio Websites
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Get your own subdomain, showcase your projects, and attract clients.
              Build a professional portfolio without writing a single line of code.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
                Start Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#features" className="btn-secondary text-lg px-8 py-4">
                Learn More
              </Link>
            </div>
          </div>

          {/* Preview mockup */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="glass rounded-2xl p-4 max-w-4xl mx-auto animate-fade-in">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center p-8">
                  <Globe className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <p className="text-2xl font-semibold text-gray-300">yourname.mysite.com</p>
                  <p className="text-gray-500 mt-2">Your portfolio, your domain</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Powerful features to help you build and manage your professional portfolio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="card-interactive">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Custom Subdomain</h3>
              <p className="text-gray-400">
                Get your unique subdomain instantly. No DNS configuration needed.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-interactive">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Beautiful Templates</h3>
              <p className="text-gray-400">
                Choose from professionally designed templates that make you stand out.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-interactive">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Uploads</h3>
              <p className="text-gray-400">
                Upload images, videos, or embed from YouTube and Vimeo with ease.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card-interactive">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Fast</h3>
              <p className="text-gray-400">
                Enterprise-grade security with lightning-fast global CDN delivery.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card-interactive">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Updates</h3>
              <p className="text-gray-400">
                Changes go live immediately. No waiting, no rebuild delays.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card-interactive">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">SEO Optimized</h3>
              <p className="text-gray-400">
                Built-in SEO tools to help clients find you through search engines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Build Your Portfolio?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of freelancers who use Porty to showcase their work and land clients.
              </p>
              <Link href="/register" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Porty</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Porty. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
