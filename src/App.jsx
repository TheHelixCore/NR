import { useEffect, useState, useMemo } from "react";
import cardsData from "./data/genesys_merged.json";
// import zeroCardsData from "./data/staplesZero.json";
import "./App.css";
import styles from "./Card.module.css";

import NIcon from "./data/images/Common.png";
import RIcon from "./data/images/Rare.png";

const rarityIcons = {
  Common: NIcon,
  Rare: RIcon,
};

const typeOrder = [
  "normal",
  "effect",
  "ritual",
  "fusion",
  "synchro",
  "xyz",
  "spell",
  "trap",
];

// normalize possible frameType strings into one of the typeOrder values
function normalizeType(frameType) {
  if (!frameType) return "unknown";
  const t = String(frameType).toLowerCase();
  if (t.includes("effect")) return "effect";
  if (t.includes("ritual")) return "ritual";
  if (t.includes("fusion")) return "fusion";
  if (t.includes("synchro")) return "synchro";
  if (t.includes("xyz")) return "xyz";
  if (t.includes("spell")) return "spell";
  if (t.includes("trap")) return "trap";
  // fallback (put unknown types after the known order)
  return "unknown";
}

function App() {
  const [cards, setCards] = useState([]);
  const [archetypes, setArchetypes] = useState([]); // add this
  const [showSpecial, setShowSpecial] = useState(false);
  const [sortDesc, setSortDesc] = useState(true); // true => Highest -> Lowest by points
  const [selectedArchetype, setSelectedArchetype] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [search, setSearch] = useState("");

  const ogCards = cardsData.data
    .map(card => ({
      ...card,
      md_rarity: card.misc_info?.[0]?.md_rarity ?? 0,
    }))
    // .map(card => `${card.md_rarity}`.replace(/Common/i, 'Normal'))
    const _cards = useMemo(() => ogCards
    .filter(card => `${card.md_rarity}` === 'Common' || `${card.md_rarity}` === 'Rare'), [ogCards]) 
    // const specialNames = zeroCardsData.map(c => c.name);
    
    // const zeroCards = useMemo(
    //   () =>
    //     ogCards
    //       .filter(c => c.genesys_points <= 0)
    //       .filter(c => specialNames.includes(c.name)),
    //   [ogCards, specialNames]
    // );

  useEffect(() => {

  // 1️⃣ Determine which array to start with
  // const displayedCards = showSpecial ? zeroCards : _cards;
  let filtered = [..._cards];

  // 2️⃣ Update archetypes dropdown based on displayedCards
  setArchetypes(
    Array.from(new Set(filtered.map((c) => c.archetype).filter(Boolean))).sort()
  );

  // 3️⃣ Apply archetype filter
  if (selectedArchetype) {
    filtered = filtered.filter((c) => c.archetype === selectedArchetype);
  }

  // 4️⃣ Apply type filter
  if (selectedType && selectedType !== "all") {
    filtered = filtered.filter((c) => normalizeType(c.frameType) === selectedType);
  }

  // 5️⃣ Apply search filter
  if (search.trim() !== "") {
    const s = search.toLowerCase();
    filtered = filtered.filter((c) => (c.name || "").toLowerCase().includes(s));
  }

  // 7️⃣ Sort
  const sorted = filtered.sort((a, b) => {
  // 1️⃣ Compare nr_status first
  const sa = Number(a.nr_status ?? 99); // default -1 if missing
  const sb = Number(b.nr_status ?? 99);

  if (sa !== sb) {
    return sa - sb; // higher nr_status first if sortDesc
  }

    const pa = a.md_rarity === 'Common' ? 0 : 1
    const pb = b.md_rarity === 'Common' ? 0 : 1
    if (pa !== pb) return sortDesc ? pb - pa : pa - pb;

    const na = normalizeType(a.frameType);
    const nb = normalizeType(b.frameType);
    let ia = typeOrder.indexOf(na);
    let ib = typeOrder.indexOf(nb);
    if (ia === -1) ia = typeOrder.length;
    if (ib === -1) ib = typeOrder.length;
    return ia - ib;
  });

  setCards(sorted);
}, [_cards, sortDesc, selectedType, selectedArchetype, search, showSpecial]);

  const toggleSort = () => setSortDesc((s) => !s);

  return (
    <div className="container">
      <div className="controls" style={{ position: "relative" }}>
      <button onClick={() => setShowSpecial((prev) => !prev)}>
        {showSpecial ? "Show All Cards" : "Show Staples"}
      </button>
    </div>
      <h1>Yu-Gi-Oh! NR Helper</h1>
      <h4> NR Banlist update: 24 Sept, 2025</h4>
      <a
      href="https://x.com/TheHelixCore"
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
    >
      <img
        src="https://abs.twimg.com/favicons/twitter.2.ico"
        alt="Twitter"
        style={{ width: "20px", height: "20px" }}
      />
      Follow me on Twitter
    </a>
      <div className="controls">
        {/* Search */}
        <input
          type="text"
          placeholder="Search cards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", marginRight: "10px", borderRadius: "6px" }}
        />

         {/* Archetype dropdown */}
          <select
            value={selectedArchetype}
            onChange={(e) => setSelectedArchetype(e.target.value)}
            style={{ padding: "8px", marginRight: "10px", borderRadius: "6px" , width: '125px'}}
          >
            <option value="">All Archetypes</option>
            {archetypes.map((arch) => (
              <option key={arch} value={arch}>
                {arch}
              </option>
            ))}
          </select>

        {/* Type selector - options come from typeOrder (normalized values) */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{ padding: "8px", marginRight: "10px", borderRadius: "6px" }}
        >
          <option value="all">All Types</option>
          {typeOrder.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>

        {/* Sort button - keeps your button style */}
        <button onClick={toggleSort}>
          Sort {sortDesc ? "Rarity: Highest → Lowest" : "Rarity: Lowest → Highest"}
        </button>
      </div>

      <div className="grid">
        {cards.map((card) => {
          const CardContent = (
            <div className={styles.cardWrapper}>
              {card.md_rarity && rarityIcons[card.md_rarity] && (
                <img
                  className={styles.cardImageWrapper}
                  src={rarityIcons[card.md_rarity]}
                  alt={card.md_rarity}
                />
              )}
              <img
               className={styles.cardImage}
                src={
                  card.card_images?.[0]?.image_url ||
                  "https://via.placeholder.com/150x210?text=No+Image"
                }
                alt={card.name}
              />
              { /* NR_Status Icon */}
                {card.nr_status >= 0 && card.nr_status <= 2 && (
              <svg
                className={styles.nrStatusIcon}
                width="40"
                height="40"
                viewBox="0 0 40 40"
              >
                {/* Outer red circle */}
                <circle cx="20" cy="20" r="20" fill="red" />
                {/* Inner black circle */}
                <circle cx="20" cy="20" r="12" fill="black" />
                {/* Number */}
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dy=".35em"
                  fill="yellow"
                  fontSize="14"
                  fontWeight="bold"
                >
                  {card.nr_status}
                </text>
              </svg>
            )}
              <p
                className="name"
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  margin: "8px 0",
                  color: "#0077cc",
                  textDecoration: "none",
                }}
              >
                {card.name}
              </p>
            </div>
          );
          return card.ygoprodeck_url ? (
            <a
              key={card.id || card.name}
              href={card.ygoprodeck_url}
              target="_blank"
              rel="noopener noreferrer"
              className="card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {CardContent}
            </a>
          ) : (
            <div key={card.id || card.name} className="card">
              {CardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
