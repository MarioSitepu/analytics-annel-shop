import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DatabaseBarangLayout({
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

