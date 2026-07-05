import { ShoppingCart } from "lucide-react";
import { VoucherFlowActions } from "@/components/voucher/voucher-flow-actions";
import { Card, CardContent } from "@/components/ui/card";

export function VoucherCartEmpty() {
  return (
    <Card className="mx-auto max-w-xl text-center">
      <CardContent className="p-8">
        <ShoppingCart className="mx-auto h-12 w-12 text-aqua-400" aria-hidden />
        <h2 className="mt-4 font-display text-xl font-semibold text-aqua-900">
          Ihr Gutschein-Warenkorb ist leer
        </h2>
        <p className="mt-2 text-slate-600">
          Wählen Sie einen Gutschein zum Verschenken oder lösen Sie einen bestehenden Code ein.
        </p>
        <div className="mt-6 flex justify-center">
          <VoucherFlowActions active="bestellen" />
        </div>
      </CardContent>
    </Card>
  );
}
