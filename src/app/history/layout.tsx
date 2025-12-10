import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

