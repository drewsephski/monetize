import { Suspense } from 'react';
import DashboardClient from './dashboard-client';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading dashboard...</div>}>
      <DashboardClient />
    </Suspense>
  );
}
