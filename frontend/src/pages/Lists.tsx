import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, X, MapPin } from "lucide-react";
import {
  useLists,
  useCreateList,
  useDeleteList,
  useRemoveFromList,
  useRestaurants,
  useAddToList,
} from "@/hooks/useApi";
import {
  Button,
  Input,
  Loader,
  EmptyState,
  ErrorState,
} from "@/components/common/UI";
import { apiError } from "@/api/axios";

function AddRestaurantDialog({
  listId,
  onClose,
}: {
  listId: number;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const { data } = useRestaurants({ search, limit: 8 });
  const addToList = useAddToList();
  const [error, setError] = useState("");

  const add = async (restaurantId: number) => {
    setError("");

    try {
      await addToList.mutateAsync({ listId, restaurantId });
      onClose();
    } catch (err) {
      setError(apiError(err, "Could not add to the list"));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add a restaurant"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="font-semibold">Add a restaurant</p>
          <button onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          <Input
            placeholder="Search restaurants"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {data?.restaurants.map((restaurant) => (
            <li key={restaurant.id}>
              <button
                onClick={() => add(restaurant.id)}
                className="flex w-full items-center justify-between rounded-lg border border-line px-3 py-2.5 text-left text-sm hover:border-brand hover:bg-brand-50"
              >
                <span>
                  <span className="font-medium">{restaurant.name}</span>
                  <span className="block text-xs text-muted">
                    {restaurant.city}
                  </span>
                </span>
                <Plus size={16} className="text-brand" />
              </button>
            </li>
          ))}

          {data?.restaurants.length === 0 && (
            <li className="py-4 text-center text-sm text-muted">
              No restaurants found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default function Lists() {
  const { data: lists, isLoading, isError, error, refetch } = useLists();
  const createList = useCreateList();
  const deleteList = useDeleteList();
  const removeFromList = useRemoveFromList();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const [formError, setFormError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    try {
      await createList.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName("");
      setDescription("");
      setCreating(false);
    } catch (err) {
      setFormError(apiError(err, "Could not create the list"));
    }
  };

  if (isLoading) return <Loader label="Loading your lists…" />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Your lists</h1>
          <p className="mt-1 text-sm text-muted">
            Group restaurants into collections you can come back to.
          </p>
        </div>

        <Button onClick={() => setCreating((v) => !v)}>
          <Plus size={16} />
          New list
        </Button>
      </div>

      {creating && (
        <form
          onSubmit={submit}
          className="mt-6 space-y-3 rounded-xl border border-line bg-white p-5"
        >
          <Input
            label="Name"
            required
            placeholder="Best Islamabad restaurants"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Description (optional)"
            placeholder="My favourite places"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex gap-2">
            <Button type="submit" loading={createList.isPending}>
              Create list
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreating(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {isError && (
        <div className="mt-8">
          <ErrorState message={apiError(error)} onRetry={() => refetch()} />
        </div>
      )}

      {lists?.length === 0 && !creating && (
        <div className="mt-8">
          <EmptyState
            title="No lists yet"
            hint="Create a list like “Date night” or “Best biryani” and add restaurants to it."
            action={<Button onClick={() => setCreating(true)}>Create a list</Button>}
          />
        </div>
      )}

      <div className="mt-8 space-y-5">
        {lists?.map((list) => (
          <section
            key={list.id}
            className="rounded-xl border border-line bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{list.name}</h2>
                {list.description && (
                  <p className="text-sm text-muted">{list.description}</p>
                )}
                <p className="mt-1 text-xs text-muted">
                  {list.restaurants.length}{" "}
                  {list.restaurants.length === 1 ? "restaurant" : "restaurants"}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setAddingTo(list.id)}>
                  <Plus size={15} />
                  Add
                </Button>

                <Button
                  variant="ghost"
                  aria-label={`Delete ${list.name}`}
                  onClick={() => {
                    if (confirm(`Delete the list "${list.name}"?`)) {
                      deleteList.mutate(list.id);
                    }
                  }}
                >
                  <Trash2 size={15} className="text-red-600" />
                </Button>
              </div>
            </div>

            {list.restaurants.length > 0 && (
              <ul className="mt-4 divide-y divide-line border-t border-line">
                {list.restaurants.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between py-3"
                  >
                    <Link
                      to={`/restaurants/${item.restaurant.id}`}
                      className="text-sm hover:text-brand"
                    >
                      <span className="font-medium">{item.restaurant.name}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                        <MapPin size={11} />
                        {item.restaurant.city}
                      </span>
                    </Link>

                    <button
                      aria-label={`Remove ${item.restaurant.name}`}
                      onClick={() =>
                        removeFromList.mutate({
                          listId: list.id,
                          restaurantId: item.restaurantId,
                        })
                      }
                      className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                    >
                      <X size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {addingTo !== null && (
        <AddRestaurantDialog
          listId={addingTo}
          onClose={() => setAddingTo(null)}
        />
      )}
    </div>
  );
}
