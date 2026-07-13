import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import {
  useRestaurants,
  useCategories,
  useSaveRestaurant,
  useDeleteRestaurant,
} from "@/hooks/useApi";
import {
  Button,
  Input,
  Loader,
  ErrorState,
} from "@/components/common/UI";
import { apiError } from "@/api/axios";
import type { Restaurant } from "@/types";

interface FormState {
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  categoryId: string;
}

const blank: FormState = {
  name: "",
  description: "",
  address: "",
  city: "",
  phone: "",
  categoryId: "",
};

export default function AdminRestaurants() {
  const [page, setPage] = useState(1);
  const query = useRestaurants({ page, limit: 20 });
  const { data: categories } = useCategories();
  const save = useSaveRestaurant();
  const remove = useDeleteRestaurant();

  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(blank);
  const [error, setError] = useState("");

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setError("");
    setOpen(true);
  };

  const openEdit = (restaurant: Restaurant) => {
    setEditing(restaurant);
    setForm({
      name: restaurant.name,
      description: restaurant.description ?? "",
      address: restaurant.address,
      city: restaurant.city,
      phone: restaurant.phone ?? "",
      categoryId: String(restaurant.categoryId),
    });
    setError("");
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await save.mutateAsync({
        id: editing?.id,
        body: {
          name: form.name,
          // Empty optional strings must be omitted: the API's zod schema
          // rejects "" for an optional url/description field.
          description: form.description || undefined,
          address: form.address,
          city: form.city,
          phone: form.phone || undefined,
          categoryId: Number(form.categoryId),
        },
      });

      setOpen(false);
    } catch (err) {
      setError(apiError(err, "Could not save the restaurant"));
    }
  };

  if (query.isLoading) return <Loader label="Loading restaurants…" />;

  if (query.isError) {
    return (
      <ErrorState
        message={apiError(query.error)}
        onRetry={() => query.refetch()}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Restaurants</h1>
          <p className="mt-1 text-sm text-muted">
            {query.data?.pagination.total} active{" "}
            {query.data?.pagination.total === 1 ? "listing" : "listings"}.
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus size={16} />
          Add restaurant
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-stone-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">City</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-line">
            {query.data?.restaurants.map((restaurant) => (
              <tr key={restaurant.id} className="hover:bg-stone-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{restaurant.name}</p>
                  <p className="truncate text-xs text-muted">
                    {restaurant.address}
                  </p>
                </td>

                <td className="px-4 py-3 text-muted">
                  {restaurant.category?.name ?? "—"}
                </td>

                <td className="px-4 py-3 text-muted">{restaurant.city}</td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      aria-label={`Edit ${restaurant.name}`}
                      onClick={() => openEdit(restaurant)}
                    >
                      <Pencil size={15} />
                    </Button>

                    <Button
                      variant="ghost"
                      aria-label={`Disable ${restaurant.name}`}
                      onClick={() => {
                        if (
                          confirm(
                            `Disable "${restaurant.name}"? It will be hidden from customers.`,
                          )
                        ) {
                          remove.mutate(restaurant.id);
                        }
                      }}
                    >
                      <Trash2 size={15} className="text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {query.data && query.data.pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          <span className="px-3 text-sm text-muted">
            Page {page} of {query.data.pagination.pages}
          </span>

          <Button
            variant="outline"
            disabled={page >= query.data.pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={editing ? "Edit restaurant" : "Add restaurant"}
          onClick={() => setOpen(false)}
        >
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-xl bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">
                {editing ? "Edit restaurant" : "Add restaurant"}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <Input
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-medium"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <Input
              label="Address"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <Input
              label="City"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />

            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <div>
              <label
                htmlFor="categoryId"
                className="mb-1.5 block text-sm font-medium"
              >
                Category
              </label>
              <select
                id="categoryId"
                required
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand"
              >
                <option value="">Select a category</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" loading={save.isPending}>
                {editing ? "Save changes" : "Create restaurant"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
