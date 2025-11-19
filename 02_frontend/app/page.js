"use client";

import { useState, useEffect } from "react";

export default function Page() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cuisine, setCuisine] = useState("");
  const [city, setCity] = useState("");
  const [minRating, setMinRating] = useState(4);

  const apiHost = process.env.NEXT_PUBLIC_API_HOST;

  async function fetchRestaurants(url) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRows(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRestaurants(`${apiHost}/restaurants`);
  }, []);

  const onSearch = () => {
    const params = new URLSearchParams();
    if (cuisine) params.append("cuisine", cuisine);
    if (city) params.append("city", city);
    if (minRating) params.append("min_rating", minRating);

    fetchRestaurants(`${apiHost}/recommend?` + params.toString());
  };

  if (loading) {
    return (
      <main className="container">
        <div className="empty">Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <div className="empty">Error: {error}</div>
      </main>
    );
  }

  return (
    <main className="container">
      <header className="header">
        <h1 className="title">Restaurant Recommender</h1>
        <p className="subtitle">
          Filter by cuisine, city, and rating to find a place to eat.
        </p>
      </header>

      <section className="filters">
        <input
          className="input"
          placeholder="Cuisine (e.g. Thai, Japanese)"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
        />
        <input
          className="input"
          placeholder="City (e.g. Bangkok)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <div className="inline">
          <label>Min rating:</label>
          <input
            className="input small"
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          />
        </div>
        <button className="btn" onClick={onSearch}>
          Search
        </button>
      </section>

      {!rows || rows.length === 0 ? (
        <div className="empty">No restaurants found.</div>
      ) : (
        <section className="grid" aria-live="polite">
          {rows.map((x) => (
            <article key={x.id} className="card" tabIndex={0}>
              {x.coverimage && (
                <div className="media">
                  <img
                    src={x.coverimage}
                    alt={x.name}
                    className="img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
              <div className="body">
                <h3 className="card-title">
                  {x.name}{" "}
                  <span className="badge">
                    {x.cuisine} · {x.city}
                  </span>
                </h3>
                {x.detail && <p className="detail">{x.detail}</p>}
                <div className="meta">
                  <small>
                    Rating: <span className="code">{x.rating}</span> · Avg price:{" "}
                    <span className="code">฿{x.avg_price}</span>
                  </small>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
