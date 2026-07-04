import { notFound } from "next/navigation";
import { OrderAdminPanel } from "@/components/admin/order-admin-panel";
import { getAdminOrderDetail } from "@/lib/actions/orders";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  try {
    const order = await getAdminOrderDetail(id);
    return <OrderAdminPanel order={order} />;
  } catch {
    notFound();
  }
}
