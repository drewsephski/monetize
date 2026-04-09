"use client";

import { useState } from "react";
import { Key, BarChart3, Copy, Check, Trash2, Plus } from "lucide-react";

// Mock data
const mockApiKeys = [
  { id: "1", name: "Production", prefix: "ak_prod_", lastUsed: "2 hours ago", usage: 1250 },
  { id: "2", name: "Development", prefix: "ak_dev_", lastUsed: "1 day ago", usage: 45 },
];

const mockUsage = {
  total: 1295,
  limit: 10000,
  byEndpoint: [
    { endpoint: "/v1/generate", calls: 850 },
    { endpoint: "/v1/status", calls: 445 },
  ],
};

export default function DashboardPage() {
  const [apiKeys, setApiKeys] = useState(mockApiKeys);
  const [newKeyName, setNewKeyName] = useState("");
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: newKeyName || "New Key",
      prefix: `ak_${Math.random().toString(36).substring(7)}_`,
      lastUsed: "Never",
      usage: 0,
    };
    setApiKeys([...apiKeys, newKey]);
    setShowNewKey(`${newKey.prefix}${Math.random().toString(36).substring(2)}`);
    setNewKeyName("");
  };

  const revokeKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
  };

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const usagePercent = (mockUsage.total / mockUsage.limit) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">API Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Pro Plan</span>
            <button className="text-sm text-blue-600 hover:underline">
              Upgrade
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Usage Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold">Usage This Month</h2>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">
                    {mockUsage.total.toLocaleString()} /{" "}
                    {mockUsage.limit.toLocaleString()} calls
                  </span>
                  <span
                    className={`font-medium ${
                      usagePercent > 80 ? "text-orange-600" : "text-green-600"
                    }`}
                  >
                    {usagePercent.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usagePercent > 80 ? "bg-orange-500" : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {mockUsage.byEndpoint.map((item) => (
                  <div
                    key={item.endpoint}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <span className="font-mono text-sm">{item.endpoint}</span>
                    <span className="text-gray-600">
                      {item.calls.toLocaleString()} calls
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* API Keys Card */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold">API Keys</h2>
            </div>

            {/* New Key Input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Key name..."
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <button
                onClick={generateKey}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Show newly created key */}
            {showNewKey && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800 mb-2">
                  Copy this key now - you won&apos;t see it again!
                </p>
                <div className="flex gap-2">
                  <code className="flex-1 bg-white border rounded px-3 py-2 text-sm font-mono truncate">
                    {showNewKey}
                  </code>
                  <button
                    onClick={() => copyKey(showNewKey, "new")}
                    className="p-2 border rounded-lg hover:bg-gray-50"
                  >
                    {copiedId === "new" ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <button
                  onClick={() => setShowNewKey(null)}
                  className="mt-2 text-sm text-green-700 hover:underline"
                >
                  I&apos;ve saved it
                </button>
              </div>
            )}

            {/* Keys List */}
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{key.name}</p>
                    <p className="text-sm text-gray-500">
                      {key.prefix}... • {key.usage.toLocaleString()} calls
                    </p>
                    <p className="text-xs text-gray-400">Last used: {key.lastUsed}</p>
                  </div>
                  <button
                    onClick={() => revokeKey(key.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Revoke key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
