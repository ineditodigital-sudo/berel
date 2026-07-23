"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ArrowRight, Check, ShoppingCart, Trash2, X } from "lucide-react";
import { money } from "@/lib/store-data";

export type CartItem = {
  slug: string;
  name: string;
  image: string;
  price: number;
  presentation?: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (slug: string, presentation: string | undefined, qty: number) => void;
  remove: (slug: string, presentation?: string) => void;
  clear: () => void;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  favorites: string[];
  toggleFavorite: (name: string) => void;
  isFavorite: (name: string) => boolean;
  toast: string;
  notify: (message: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "berel-cart-v1";
const keyOf = (slug: string, presentation?: string) =>
  `${slug}__${presentation ?? ""}`;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // Load persisted cart/favorites once on the client.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Client-only hydration from the external localStorage source.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (Array.isArray(parsed.items)) setItems(parsed.items);
        if (Array.isArray(parsed.favorites)) setFavorites(parsed.favorites);
      }
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items, favorites }),
      );
    } catch {
      /* storage may be unavailable */
    }
  }, [items, favorites, hydrated]);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }, []);

  const add = useCallback(
    (item: Omit<CartItem, "qty">, qty = 1) => {
      setItems((current) => {
        const id = keyOf(item.slug, item.presentation);
        const existing = current.find(
          (entry) => keyOf(entry.slug, entry.presentation) === id,
        );
        if (existing) {
          return current.map((entry) =>
            keyOf(entry.slug, entry.presentation) === id
              ? { ...entry, qty: entry.qty + qty }
              : entry,
          );
        }
        return [...current, { ...item, qty }];
      });
      notify("Producto agregado al carrito");
    },
    [notify],
  );

  const setQty = useCallback(
    (slug: string, presentation: string | undefined, qty: number) => {
      setItems((current) =>
        current
          .map((entry) =>
            keyOf(entry.slug, entry.presentation) === keyOf(slug, presentation)
              ? { ...entry, qty: Math.max(0, qty) }
              : entry,
          )
          .filter((entry) => entry.qty > 0),
      );
    },
    [],
  );

  const remove = useCallback((slug: string, presentation?: string) => {
    setItems((current) =>
      current.filter(
        (entry) =>
          keyOf(entry.slug, entry.presentation) !== keyOf(slug, presentation),
      ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const toggleFavorite = useCallback((name: string) => {
    setFavorites((current) =>
      current.includes(name)
        ? current.filter((entry) => entry !== name)
        : [...current, name],
    );
  }, []);

  const isFavorite = useCallback(
    (name: string) => favorites.includes(name),
    [favorites],
  );

  const count = useMemo(
    () => items.reduce((sum, entry) => sum + entry.qty, 0),
    [items],
  );
  const total = useMemo(
    () => items.reduce((sum, entry) => sum + entry.qty * entry.price, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count,
      total,
      add,
      setQty,
      remove,
      clear,
      cartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      favorites,
      toggleFavorite,
      isFavorite,
      toast,
      notify,
    }),
    [
      items,
      count,
      total,
      add,
      setQty,
      remove,
      clear,
      cartOpen,
      favorites,
      toggleFavorite,
      isFavorite,
      toast,
      notify,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
      {toast && (
        <div className="toast" role="status">
          <Check />
          {toast}
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

function CartDrawer() {
  const {
    items,
    count,
    total,
    setQty,
    remove,
    clear,
    cartOpen,
    closeCart,
  } = useCart();
  return (
    <>
      <div
        className={cartOpen ? "drawer-backdrop open" : "drawer-backdrop"}
        onClick={closeCart}
      />
      <aside
        className={cartOpen ? "cart-drawer open" : "cart-drawer"}
        aria-hidden={!cartOpen}
      >
        <div className="drawer-head">
          <div>
            <small>Tu compra</small>
            <h3>Carrito ({count})</h3>
          </div>
          <button onClick={closeCart} aria-label="Cerrar carrito">
            <X />
          </button>
        </div>
        {items.length ? (
          <div className="drawer-body">
            {items.map((item) => (
              <div
                className="drawer-item"
                key={`${item.slug}-${item.presentation ?? ""}`}
              >
                <img src={item.image} alt={item.name} />
                <div>
                  <b>{item.name}</b>
                  <small>
                    {item.presentation ? `${item.presentation} · ` : ""}
                    {money(item.price)}
                  </small>
                  <div className="drawer-qty">
                    <button
                      onClick={() =>
                        setQty(item.slug, item.presentation, item.qty - 1)
                      }
                      aria-label={`Quitar una unidad de ${item.name}`}
                    >
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() =>
                        setQty(item.slug, item.presentation, item.qty + 1)
                      }
                      aria-label={`Agregar una unidad de ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => remove(item.slug, item.presentation)}
                  aria-label={`Eliminar ${item.name}`}
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-cart">
            <ShoppingCart />
            <h4>Tu carrito está vacío</h4>
            <p>Explora los productos destacados y agrega tus favoritos.</p>
          </div>
        )}
        <div className="drawer-footer">
          {items.length > 0 && (
            <div className="drawer-total">
              <span>Total estimado</span>
              <b>{money(total)}</b>
            </div>
          )}
          <button
            disabled={!items.length}
            onClick={() => {
              window.location.href = "/checkout";
            }}
          >
            Continuar compra <ArrowRight />
          </button>
          {items.length > 0 && (
            <button className="drawer-clear" onClick={clear}>
              Vaciar carrito
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
