import { AdminGate } from '../components/admin/AdminGate';
import { ImageManager } from '../components/admin/ImageManager';

export function AdminPage() {
  return (
    <AdminGate>
      <ImageManager />
    </AdminGate>
  );
}
