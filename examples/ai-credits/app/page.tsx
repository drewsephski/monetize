"use client";

import { useState, useEffect } from "react";
import { Sparkles, Coins, Zap, AlertTriangle, Check } from "lucide-react";

// Mock credit packages
const CREDIT_PACKAGES = [
  { id: "credits_100", amount: 100, price: 10, label: "100 Credits", popular: false },
  { id: "credits_500", amount: 500, price: 40, label: "500 Credits", popular: true, savings: "20%" },
  { id: "credits_2000", amount: 2000, price: 120, label: "2000 Credits", popular: false, savings: "40%" },
];

export default function AICreditsPage() {
  const [credits, setCredits] = useState(25); // Start with some credits
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

  // Check if credits are low
  const isLowCredits = credits < 10 && credits > 0;
  const isOutOfCredits = credits === 0;

  const generateContent = async () => {
    if (credits < 5) {
      setShowPurchaseModal(true);
      return;
    }

    setIsGenerating(true);
    
    // Simulate generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setGeneratedContent(
      "Here's an AI-generated poem about technology:\n\n" +
      "Silicon dreams in circuits flow,\n" +
      "Where human thought and code both grow.\n" +
      "Through neural nets the answers come,\n" +
      "A new age dawns, a digital drum."
    );
    
    setCredits((c) => c - 5); // Deduct 5 credits
    setIsGenerating(false);
  };

  const purchaseCredits = async (packageId: string) => {
    setPurchaseLoading(packageId);
    
    // Simulate checkout
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
    if (pkg) {
      setCredits((c) => c + pkg.amount);
    }
    
    setPurchaseLoading(null);
    setShowPurchaseModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="font-bold text-lg">AI Credits Demo</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isLowCredits ? "bg-orange-500/20 text-orange-400" : 
              isOutOfCredits ? "bg-red-500/20 text-red-400" : "bg-white/10"
            }`}>
              <Coins className="w-4 h-4" />
              <span className="font-semibold">{credits} credits</span>
            </div>
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Buy Credits
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Low Credit Warning */}
        {isLowCredits && (
          <div className="mb-6 bg-orange-500/20 border border-orange-500/30 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <div className="flex-1">
              <p className="font-medium text-orange-200">Running low on credits</p>
              <p className="text-sm text-orange-300/80">
                You have {credits} credits left. Each generation uses 5 credits.
              </p>
            </div>
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Buy More
            </button>
          </div>
        )}

        {/* Out of Credits Paywall */}
        {isOutOfCredits ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Coins className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Out of Credits</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              You&apos;ve used all your credits. Purchase more to continue generating content.
            </p>
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Purchase Credits
            </button>
          </div>
        ) : (
          <>
            {/* Generator */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Generate Content</h2>
              <p className="text-gray-400 mb-6">
                This costs <span className="text-purple-400 font-semibold">5 credits</span> per generation.
              </p>

              {generatedContent ? (
                <div className="space-y-4">
                  <div className="bg-black/30 rounded-xl p-6 whitespace-pre-wrap">
                    {generatedContent}
                  </div>
                  <button
                    onClick={() => setGeneratedContent(null)}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Generate something else
                  </button>
                </div>
              ) : (
                <button
                  onClick={generateContent}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Zap className="w-5 h-5 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate (5 credits)
                    </>
                  )}
                </button>
              )}
            </div>

            {/* How Credits Work */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-400 mb-1">5</div>
                <div className="text-sm text-gray-400">credits per generation</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-400 mb-1">100</div>
                <div className="text-sm text-gray-400">credits = $10</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-400 mb-1">20</div>
                <div className="text-sm text-gray-400">generations per $10</div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-2">Purchase Credits</h3>
            <p className="text-gray-400 mb-6">Choose a credit package to continue generating.</p>

            <div className="space-y-3 mb-6">
              {CREDIT_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => purchaseCredits(pkg.id)}
                  disabled={purchaseLoading === pkg.id}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    pkg.popular
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {pkg.label}
                        {pkg.popular && (
                          <span className="bg-purple-600 text-xs px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        ${pkg.price} {pkg.savings && `(${pkg.savings} off)`}
                      </div>
                    </div>
                    {purchaseLoading === pkg.id ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <div className="text-right">
                        <div className="font-bold">${pkg.price}</div>
                        {pkg.savings && (
                          <div className="text-xs text-green-400">Save {pkg.savings}</div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 border border-white/20 py-3 rounded-xl font-medium hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500">
          <p>Built with @drew/billing</p>
        </div>
      </footer>
    </div>
  );
}
