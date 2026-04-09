"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Key,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Loader2,
  Package,
  Zap,
  Shield,
  Building2,
} from "lucide-react";

interface License {
  id: string;
  licenseKey: string;
  licenseKeyMasked: string;
  tier: "free" | "pro" | "team" | "enterprise";
  status: "active" | "expired" | "revoked";
  features: string[];
  usageLimits: Record<string, number>;
  currentUsage: Record<string, number>;
  expiresAt: string | null;
  lastVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const tierIcons: Record<string, React.ReactNode> = {
  free: <Package className="h-5 w-5 text-gray-500" />,
  pro: <Zap className="h-5 w-5 text-yellow-500" />,
  team: <Building2 className="h-5 w-5 text-blue-500" />,
  enterprise: <Shield className="h-5 w-5 text-purple-500" />,
};

const tierColors: Record<string, string> = {
  free: "bg-gray-100 text-gray-700",
  pro: "bg-yellow-100 text-yellow-700",
  team: "bg-blue-100 text-blue-700",
  enterprise: "bg-purple-100 text-purple-700",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  revoked: "bg-gray-100 text-gray-700",
};

export default function LicensesPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [regenerateDialog, setRegenerateDialog] = useState<{
    open: boolean;
    license: License | null;
  }>({ open: false, license: null });

  useEffect(() => {
    if (!sessionPending && !session) {
      router.push("/signin?callbackUrl=/dashboard/licenses");
      return;
    }

    if (session) {
      fetchLicenses();
    }
  }, [session, sessionPending, router]);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/licenses");

      if (!response.ok) {
        throw new Error("Failed to fetch licenses");
      }

      const data = await response.json();
      setLicenses(data.licenses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyReveal = (licenseId: string) => {
    setRevealedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(licenseId)) {
        newSet.delete(licenseId);
      } else {
        newSet.add(licenseId);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (license: License) => {
    try {
      await navigator.clipboard.writeText(license.licenseKey);
      setCopiedId(license.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      setCopiedId(license.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleRegenerate = async () => {
    if (!regenerateDialog.license) return;

    try {
      setRegeneratingId(regenerateDialog.license.id);
      const response = await fetch(
        `/api/licenses/${regenerateDialog.license.id}/regenerate`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to regenerate license");
      }

      const data = await response.json();

      // Update the license in the list
      setLicenses((prev) =>
        prev.map((l) =>
          l.id === data.licenseId
            ? {
                ...l,
                licenseKey: data.licenseKey,
                licenseKeyMasked: data.licenseKeyMasked,
                updatedAt: new Date().toISOString(),
              }
            : l
        )
      );

      // Auto-reveal the new key
      setRevealedKeys((prev) => new Set(prev).add(data.licenseId));

      setRegenerateDialog({ open: false, license: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate");
    } finally {
      setRegeneratingId(null);
    }
  };

  const getUsagePercentage = (license: License) => {
    const limit = license.usageLimits?.apiCalls || 1000;
    if (limit === -1) return 0;
    const current = license.currentUsage?.apiCalls || 0;
    return Math.min(100, Math.round((current / limit) * 100));
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (sessionPending || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/dashboard" className="hover:text-gray-700">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">SDK Licenses</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">SDK Licenses</h1>
        <p className="mt-1 text-gray-600">
          Manage your Drew Billing SDK license keys
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        </div>
      )}

      {/* Empty State */}
      {licenses.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="mb-4 h-12 w-12 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900">No licenses yet</h3>
            <p className="mt-2 max-w-sm text-center text-gray-600">
              Purchase an SDK license to get started with Drew Billing in your own
              applications.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Licenses List */}
      <div className="space-y-4">
        {licenses.map((license) => {
          const isRevealed = revealedKeys.has(license.id);
          const usagePercent = getUsagePercentage(license);

          return (
            <Card key={license.id}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      {tierIcons[license.tier]}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {license.tier.charAt(0).toUpperCase() +
                          license.tier.slice(1)}{" "}
                        License
                      </CardTitle>
                      <CardDescription>
                        Created {formatDate(license.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={tierColors[license.tier]}>
                      {license.tier}
                    </Badge>
                    <Badge className={statusColors[license.status]}>
                      {license.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* License Key */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-gray-400" />
                      <code className="text-sm font-mono">
                        {isRevealed
                          ? license.licenseKey
                          : license.licenseKeyMasked}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleKeyReveal(license.id)}
                      >
                        {isRevealed ? (
                          <>
                            <EyeOff className="mr-1 h-4 w-4" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="mr-1 h-4 w-4" />
                            Reveal
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(license)}
                        disabled={copiedId === license.id}
                      >
                        {copiedId === license.id ? (
                          <>
                            <Copy className="mr-1 h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-500">API Calls</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full ${
                            usagePercent > 90
                              ? "bg-red-500"
                              : usagePercent > 70
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {license.currentUsage?.apiCalls || 0} /{" "}
                        {license.usageLimits?.apiCalls === -1
                          ? "∞"
                          : license.usageLimits?.apiCalls || 1000}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Projects</p>
                    <p className="font-medium">
                      {license.usageLimits?.projects === -1
                        ? "Unlimited"
                        : license.usageLimits?.projects || 1}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Team Members</p>
                    <p className="font-medium">
                      {license.usageLimits?.teamMembers === -1
                        ? "Unlimited"
                        : license.usageLimits?.teamMembers || 1}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {license.features?.slice(0, 5).map((feature) => (
                    <Badge
                      key={feature}
                      variant="outline"
                      className="text-xs"
                    >
                      {feature.replace(/_/g, " ")}
                    </Badge>
                  ))}
                  {license.features?.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{license.features.length - 5} more
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="text-sm text-gray-500">
                    Last verified: {formatDate(license.lastVerifiedAt)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setRegenerateDialog({ open: true, license })
                      }
                      disabled={regeneratingId === license.id}
                    >
                      {regeneratingId === license.id ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-1 h-4 w-4" />
                      )}
                      Regenerate
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href="/docs/sdk/getting-started"
                        target="_blank"
                      >
                        <ExternalLink className="mr-1 h-4 w-4" />
                        Docs
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Regenerate Confirmation Dialog */}
      <Dialog
        open={regenerateDialog.open}
        onOpenChange={(open: boolean) =>
          setRegenerateDialog({ open, license: open ? regenerateDialog.license : null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate License Key?</DialogTitle>
            <DialogDescription>
              This will invalidate your current license key and generate a new
              one. You&apos;ll need to update your applications with the new key.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
            <AlertCircle className="mb-2 h-5 w-5" />
            <p>
              <strong>Warning:</strong> Your old license key will stop working
              immediately. Make sure to update your environment variables after
              regenerating.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRegenerateDialog({ open: false, license: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegenerate}
              disabled={regeneratingId !== null}
            >
              {regeneratingId ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                "Yes, Regenerate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
