import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./utils";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { Rating } from "@/components/common/UI";
import type { Restaurant } from "@/types";

const restaurant: Restaurant = {
  id: 1,
  name: "Monal Restaurant",
  description: "Premium dining with a view",
  address: "Pir Sohawa Road",
  city: "Islamabad",
  phone: null,
  email: null,
  website: null,
  openingTime: null,
  closingTime: null,
  latitude: null,
  longitude: null,
  isActive: true,
  createdAt: new Date().toISOString(),
  categoryId: 1,
  category: { id: 1, name: "Fine Dining" },
  reviews: [
    {
      id: 1,
      rating: 5,
      comment: null,
      createdAt: "",
      userId: 1,
      restaurantId: 1,
      user: { id: 1, name: "A" },
    },
    {
      id: 2,
      rating: 4,
      comment: null,
      createdAt: "",
      userId: 2,
      restaurantId: 1,
      user: { id: 2, name: "B" },
    },
  ],
};

describe("RestaurantCard", () => {
  it("renders the name, city and category", () => {
    renderWithProviders(<RestaurantCard restaurant={restaurant} />);

    expect(screen.getByText("Monal Restaurant")).toBeInTheDocument();
    expect(screen.getByText("Islamabad")).toBeInTheDocument();
    expect(screen.getByText("Fine Dining")).toBeInTheDocument();
  });

  it("averages the reviews (5 and 4 -> 4.5)", () => {
    renderWithProviders(<RestaurantCard restaurant={restaurant} />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("links to the detail page", () => {
    renderWithProviders(<RestaurantCard restaurant={restaurant} />);

    const links = screen.getAllByRole("link");
    expect(links.some((l) => l.getAttribute("href") === "/restaurants/1")).toBe(
      true,
    );
  });

  it("hides the favorite button for logged-out visitors", () => {
    renderWithProviders(<RestaurantCard restaurant={restaurant} />);
    expect(screen.queryByRole("button", { name: /save|remove/i })).toBeNull();
  });

  it("toggles a favorite when the handler is provided", async () => {
    const onToggleFavorite = vi.fn();

    renderWithProviders(
      <RestaurantCard
        restaurant={restaurant}
        isFavorite
        onToggleFavorite={onToggleFavorite}
      />,
    );

    const button = screen.getByRole("button", { name: /remove .* favorites/i });
    expect(button).toHaveAttribute("aria-pressed", "true");

    button.click();
    expect(onToggleFavorite).toHaveBeenCalledWith(restaurant);
  });

  it("falls back to an initial when there is no image", () => {
    renderWithProviders(<RestaurantCard restaurant={restaurant} />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("M")).toBeInTheDocument();
  });
});

describe("Rating", () => {
  it("says so when a restaurant has no reviews", () => {
    renderWithProviders(<Rating value={null} />);
    expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
  });

  it("shows the score and review count", () => {
    renderWithProviders(<Rating value={4.5} count={2} />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("(2 reviews)")).toBeInTheDocument();
  });
});
