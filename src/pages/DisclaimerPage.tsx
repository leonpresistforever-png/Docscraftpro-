import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 pt-24 flex flex-col selection:bg-[#D4AF37] selection:text-white">
      <Navbar />

      <main className="w-full max-w-[800px] mx-auto px-6 py-16 flex-1">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm">
          <div className="mb-10 border-b border-gray-200 pb-8">
            <h1 className="text-4xl font-black text-gray-900 font-serif tracking-tight mb-4">Website Disclaimer</h1>
            <p className="text-gray-500 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-8 text-sm md:text-base text-gray-700 leading-relaxed">
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Informational Purposes Only</h2>
              <p>
                The information provided by DocCraft Pro ("we," "us," or "our") on this website and our mobile application is for general informational purposes only. All information on the site and our mobile application is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Professional Advice</h2>
              <p>
                The site cannot and does not contain legal, financial, or specific operational advice. The operational and legal document templates and guidelines are provided for general informational and educational purposes only and are not a substitute for professional advice. Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals.
              </p>
              <p className="mt-4 font-medium text-gray-900 p-4 bg-amber-50 rounded-lg border border-amber-100">
                THE USE OR RELIANCE OF ANY INFORMATION CONTAINED ON THIS SITE IS SOLELY AT YOUR OWN RISK.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. External Links Disclaimer</h2>
              <p>
                The site may contain (or you may be sent through the site) links to other websites or content belonging to or originating from third parties or links to websites and features in banners or other advertising. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.
              </p>
              <p className="mt-4">
                We do not warrant, endorse, guarantee, or assume responsibility for the accuracy or reliability of any information offered by third-party websites linked through the site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Limitation of Liability</h2>
              <p>
                Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site. Your use of the site and your reliance on any information on the site is solely at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Contact Us</h2>
              <p>
                If you have any questions, concerns, or requests regarding this disclaimer, please contact us via our secure Support Portal or email our compliance desk directly.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
