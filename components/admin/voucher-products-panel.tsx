"use client";

import Image from "next/image";
import { Fragment, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  createVoucherProduct,
  deleteVoucherProduct,
  updateVoucherProduct,
} from "@/lib/actions/voucher-admin";
import { shootingTypeLabels } from "@/lib/shooting-types";
import { voucherProductImageRequirements } from "@/lib/voucher-image-shared";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatEuro } from "@/lib/pricing";
import type { ShootingType } from "@prisma/client";
import { cn } from "@/lib/utils";

export type AdminVoucherProduct = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number;
  shootingType: ShootingType | null;
  sortOrder: number;
  active: boolean;
  soldCount: number;
};

type Props = {
  products: AdminVoucherProduct[];
};

const shootingTypes = Object.keys(shootingTypeLabels) as ShootingType[];

function ProductFormFields({
  product,
  prefix,
}: {
  product?: AdminVoucherProduct;
  prefix: string;
}) {
  return (
    <>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${prefix}-title`}>Titel *</Label>
        <Input
          id={`${prefix}-title`}
          name="title"
          required
          defaultValue={product?.title}
          placeholder="z. B. Unterwasser-Shooting Gutschein"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${prefix}-description`}>Beschreibung</Label>
        <Textarea
          id={`${prefix}-description`}
          name="description"
          rows={2}
          defaultValue={product?.description ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-priceEuro`}>Preis (€) *</Label>
        <Input
          id={`${prefix}-priceEuro`}
          name="priceEuro"
          type="number"
          step="0.01"
          min="0.01"
          required
          defaultValue={product ? product.priceCents / 100 : undefined}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-sortOrder`}>Sortierung</Label>
        <Input
          id={`${prefix}-sortOrder`}
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={product?.sortOrder ?? 0}
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${prefix}-shootingType`}>Shooting-Art (optional)</Label>
        <select
          id={`${prefix}-shootingType`}
          name="shootingType"
          defaultValue={product?.shootingType ?? "NONE"}
          className="flex h-11 w-full rounded-2xl border border-aqua-200/60 bg-white px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-500"
        >
          <option value="NONE">— Keine Zuordnung —</option>
          {shootingTypes.map((type) => (
            <option key={type} value={type}>
              {shootingTypeLabels[type]}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
        <input
          type="checkbox"
          name="active"
          defaultChecked={product?.active ?? true}
          className="rounded border-slate-300"
        />
        Im Shop sichtbar (aktiv)
      </label>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${prefix}-image`}>Produktbild</Label>
        {product?.imageUrl && (
          <div className="flex items-start gap-4">
            <Image
              src={product.imageUrl}
              alt=""
              width={160}
              height={120}
              className="rounded-lg border border-slate-200 object-cover"
              unoptimized={product.imageUrl.startsWith("/uploads/")}
            />
            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" name="removeImage" className="mt-1 rounded border-slate-300" />
              Bild entfernen
            </label>
          </div>
        )}
        <Input
          id={`${prefix}-image`}
          name="image"
          type="file"
          accept={voucherProductImageRequirements.acceptedTypes.join(",")}
        />
        <p className="text-xs text-slate-500">{voucherProductImageRequirements.hint}</p>
      </div>
    </>
  );
}

export function VoucherProductsPanel({ products }: Props) {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createPending, startCreate] = useTransition();
  const [editPending, startEdit] = useTransition();
  const [deletePending, startDelete] = useTransition();
  const { confirm, confirmDialog } = useConfirm();

  async function handleDeleteProduct(product: AdminVoucherProduct) {
    const ok = await confirm({
      title:
        product.soldCount > 0
          ? `${product.title} deaktivieren?`
          : `${product.title} löschen?`,
      description:
        product.soldCount > 0
          ? `Das Produkt wird deaktiviert. Bereits ${product.soldCount} verkaufte Gutscheine bleiben gültig – endgültiges Löschen ist nicht möglich.`
          : "Das Gutschein-Produkt wird endgültig entfernt und erscheint nicht mehr im Shop.",
      confirmLabel: product.soldCount > 0 ? "Deaktivieren" : "Endgültig löschen",
      variant: "destructive",
    });
    if (!ok) return;

    setMessage(null);
    setError(null);

    startDelete(async () => {
      const result = await deleteVoucherProduct(product.id);
      if (result.error) setError(result.error);
      else setMessage(result.message ?? "Erledigt.");
      setEditingId(null);
      router.refresh();
    });
  }

  function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startCreate(async () => {
      setMessage(null);
      setError(null);
      const result = await createVoucherProduct(formData);
      if (result.error) setError(result.error);
      else {
        setMessage("Gutschein-Produkt angelegt.");
        setShowCreateForm(false);
        router.refresh();
      }
    });
  }

  function handleEditSubmit(productId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startEdit(async () => {
      setMessage(null);
      setError(null);
      const result = await updateVoucherProduct(productId, formData);
      if (result.error) setError(result.error);
      else {
        setMessage("Produkt aktualisiert.");
        setEditingId(null);
        router.refresh();
      }
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-aqua-900">Gutschein-Produkte</h2>
          <p className="mt-1 text-sm text-slate-600">
            Angebote auf der Seite /gutschein – hinzufügen, bearbeiten oder deaktivieren/löschen.
          </p>
        </div>
        {!showCreateForm && (
          <Button type="button" onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            Gutschein-Produkt hinzufügen
          </Button>
        )}
      </div>

      {(message || error) && (
        <p
          className={cn(
            "rounded-xl px-4 py-3 text-sm",
            error ? "bg-red-50 text-red-700" : "bg-aqua-50 text-aqua-800",
          )}
          role="status"
        >
          {error ?? message}
        </p>
      )}

      {showCreateForm && (
        <form
          className="grid gap-4 rounded-2xl border border-aqua-100 bg-white p-6 shadow-sm sm:grid-cols-2"
          onSubmit={handleCreateSubmit}
        >
          <div className="flex items-center justify-between sm:col-span-2">
            <h3 className="font-semibold text-aqua-900">Neues Gutschein-Produkt</h3>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
              Schließen
            </Button>
          </div>
          <ProductFormFields prefix="new" />
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <Button type="submit" disabled={createPending}>
              {createPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Wird gespeichert…
                </>
              ) : (
                "Produkt speichern"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
              Abbrechen
            </Button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <p className="text-sm text-slate-500">Noch keine Gutschein-Produkte.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Bild</th>
                <th className="p-4">Titel</th>
                <th className="p-4">Preis</th>
                <th className="p-4">Art</th>
                <th className="p-4">Status</th>
                <th className="p-4">Verkauft</th>
                <th className="p-4">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <Fragment key={product.id}>
                  <tr className="border-b border-slate-50 align-top">
                    <td className="p-4">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt=""
                          width={72}
                          height={54}
                          className="rounded-lg border border-slate-200 object-cover"
                          unoptimized={product.imageUrl.startsWith("/uploads/")}
                        />
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-aqua-900">{product.title}</p>
                      {product.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {product.description}
                        </p>
                      )}
                    </td>
                    <td className="p-4">{formatEuro(product.priceCents)}</td>
                    <td className="p-4 text-slate-600">
                      {product.shootingType
                        ? shootingTypeLabels[product.shootingType]
                        : "—"}
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          product.active
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-600",
                        )}
                      >
                        {product.active ? "Aktiv" : "Inaktiv"}
                      </span>
                    </td>
                    <td className="p-4">{product.soldCount}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingId(editingId === product.id ? null : product.id);
                            setMessage(null);
                            setError(null);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                          Bearbeiten
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={deletePending}
                          onClick={() => void handleDeleteProduct(product)}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          {product.soldCount > 0 ? "Deaktivieren" : "Löschen"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {editingId === product.id && (
                    <tr className="bg-aqua-50/40">
                      <td colSpan={7} className="p-4">
                        <form
                          className="grid gap-4 sm:grid-cols-2"
                          onSubmit={(event) => handleEditSubmit(product.id, event)}
                        >
                          <ProductFormFields product={product} prefix={`edit-${product.id}`} />
                          <div className="flex flex-wrap gap-2 sm:col-span-2">
                            <Button type="submit" size="sm" disabled={editPending}>
                              {editPending ? "Speichern…" : "Speichern"}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingId(null)}
                            >
                              Abbrechen
                            </Button>
                          </div>
                        </form>
                        <div className="mt-3 flex justify-end border-t border-aqua-100 pt-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={deletePending || editPending}
                            className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50 hover:text-red-800"
                            onClick={() => void handleDeleteProduct(product)}
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                            {product.soldCount > 0 ? "Produkt deaktivieren" : "Produkt löschen"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {confirmDialog}
    </section>
  );
}
