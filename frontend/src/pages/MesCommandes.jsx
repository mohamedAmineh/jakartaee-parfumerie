import { useEffect, useState } from "react";

const API = "http://localhost:8080/starter/api/orders";

export default function MesCommandes() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(API, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.status === 401) {
          throw new Error("Non autorisé. Connecte-toi.");
        }

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `HTTP ${res.status}`);
        }

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) return <p>Chargement des commandes...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Mes commandes</h2>

      {orders.length === 0 ? (
        <p>Aucune commande passée.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <p><strong>Date :</strong> {order.orderDate}</p>
            <p><strong>Statut :</strong> {order.status}</p>
            <p><strong>Total :</strong> {order.totalPrice} €</p>
          </div>
        ))
      )}
    </div>
  );
}
