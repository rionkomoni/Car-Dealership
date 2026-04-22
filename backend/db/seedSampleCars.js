/**
 * Adds spec columns to `cars` (safe if already present) and seeds demo rows when empty.
 * Demo set: 10 realistic BMW/Audi/Mercedes listings with detailed specs.
 */

async function ensureCarSpecColumns(pool) {
  const fragments = [
    "ADD COLUMN mileage_km INT NULL",
    "ADD COLUMN fuel VARCHAR(40) NULL",
    "ADD COLUMN transmission VARCHAR(40) NULL",
    "ADD COLUMN engine VARCHAR(100) NULL",
    "ADD COLUMN power_hp SMALLINT UNSIGNED NULL",
    "ADD COLUMN color VARCHAR(50) NULL",
    "ADD COLUMN body_type VARCHAR(40) NULL",
    "ADD COLUMN description TEXT NULL",
    "ADD COLUMN gallery LONGTEXT NULL",
    "ADD COLUMN sold_out TINYINT(1) NOT NULL DEFAULT 0",
  ];

  for (const fragment of fragments) {
    try {
      await pool.query(`ALTER TABLE cars ${fragment}`);
    } catch (err) {
      const dup =
        err.code === "ER_DUP_FIELDNAME" ||
        (err.message && err.message.includes("Duplicate column name"));
      if (!dup) {
        console.warn("cars column migration:", err.message);
      }
    }
  }
}

/** Dy pamje shtesë për çdo veturë (kënde të ndryshme). */
const SAMPLES = [
  {
    name: "BMW M4 Competition",
    price: 78500,
    year: 2023,
    image:
      "https://images.unsplash.com/photo-1617814076367-b75995f65d1c?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1000&q=80",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&q=80",
    ],
    mileage_km: 18200,
    fuel: "Petrol",
    transmission: "8-speed M Steptronic",
    engine: "3.0L I6 twin-turbo",
    power_hp: 503,
    color: "Isle of Man Green",
    body_type: "Coupe",
    description:
      "M xDrive, carbon roof, adaptive M suspension. Track-ready coupe with everyday usability.",
    sold_out: 0,
  },
  {
    name: "BMW X5 xDrive40i",
    price: 72900,
    year: 2023,
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1606016159991-dfe4f264a20d?w=1000&q=80",
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1000&q=80",
    ],
    mileage_km: 24800,
    fuel: "Petrol",
    transmission: "8-speed automatic",
    engine: "3.0L I6 turbo mild hybrid",
    power_hp: 381,
    color: "Mineral White",
    body_type: "SUV",
    description:
      "Panoramic roof, Vernasca leather, Driving Assistant Professional. Spacious luxury SUV.",
    sold_out: 0,
  },
  {
    name: "BMW i4 M50",
    price: 66900,
    year: 2024,
    image:
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000&q=80",
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1000&q=80",
    ],
    mileage_km: 6200,
    fuel: "Electric",
    transmission: "Single-speed",
    engine: "Dual motor AWD",
    power_hp: 544,
    color: "Portimao Blue",
    body_type: "Gran Coupe",
    description:
      "M adaptive suspension, IconicSounds Electric, long range. Silent M performance.",
    sold_out: 0,
  },
  {
    name: "Audi RS6 Avant performance",
    price: 125000,
    year: 2023,
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1000&q=80&fit=crop&crop=entropy",
      "https://images.unsplash.com/photo-1614200187524-dc4118d55aa8?w=1000&q=80",
    ],
    mileage_km: 14100,
    fuel: "Petrol",
    transmission: "8-speed Tiptronic",
    engine: "4.0L V8 twin-turbo",
    power_hp: 630,
    color: "Nardo Gray",
    body_type: "Wagon",
    description:
      "Quattro sport diff, RS sport exhaust, panoramic roof. The ultimate fast family wagon.",
    sold_out: 1,
  },
  {
    name: "Audi Q8 55 TFSI quattro",
    price: 78900,
    year: 2022,
    image:
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=1000&q=80&auto=format",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&q=80",
    ],
    mileage_km: 38900,
    fuel: "Petrol",
    transmission: "8-speed automatic",
    engine: "3.0L V6 turbo mild hybrid",
    power_hp: 340,
    color: "Navarra Blue",
    body_type: "SUV",
    description:
      "HD Matrix LED, air suspension, Valcona leather. Coupe-SUV presence with quattro grip.",
    sold_out: 0,
  },
  {
    name: "Audi e-tron GT quattro",
    price: 104900,
    year: 2023,
    image:
      "https://images.unsplash.com/photo-1614200187524-dc4118d55aa8?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1614200187524-dc4118d55aa8?w=1000&q=80&fit=crop",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1000&q=80",
    ],
    mileage_km: 9200,
    fuel: "Electric",
    transmission: "2-speed (rear)",
    engine: "Dual asynchronous motors",
    power_hp: 476,
    color: "Daytona Gray",
    body_type: "Gran Turismo",
    description:
      "800V charging, adaptive air suspension, laser-light option. Audi’s electric grand tourer.",
    sold_out: 0,
  },
  {
    name: "Mercedes-AMG C63 S",
    price: 71800,
    year: 2022,
    image:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1000&q=80&fit=crop",
      "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=1000&q=80",
    ],
    mileage_km: 34100,
    fuel: "Petrol",
    transmission: "9-speed AMG Speedshift",
    engine: "4.0L V8 biturbo",
    power_hp: 503,
    color: "Obsidian Black",
    body_type: "Sedan",
    description:
      "AMG Performance seats, Burmester 3D, rear-axle steering. Thundering V8 executive.",
    sold_out: 0,
  },
  {
    name: "Mercedes-AMG EQS 53 4MATIC+",
    price: 132000,
    year: 2023,
    image:
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1000&q=80&fit=crop",
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1000&q=80",
    ],
    mileage_km: 11200,
    fuel: "Electric",
    transmission: "Single-speed",
    engine: "Dual motor AMG",
    power_hp: 658,
    color: "High-Tech Silver",
    body_type: "Sedan",
    description:
      "Hyperscreen, AMG Ride Control+, rear-wheel steering. Silent flagship with AMG edge.",
    sold_out: 1,
  },
  {
    name: "Mercedes-AMG GLA 45 S",
    price: 58900,
    year: 2023,
    image:
      "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=1000&q=80&fit=crop",
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1000&q=80",
    ],
    mileage_km: 19500,
    fuel: "Petrol",
    transmission: "8-speed DCT",
    engine: "2.0L I4 turbo",
    power_hp: 421,
    color: "Sun Yellow",
    body_type: "SUV",
    description:
      "AMG Performance 4MATIC+, sport exhaust, MBUX. Compact SUV with hyper-hatch pace.",
    sold_out: 0,
  },
  {
    name: "Mercedes-Benz GLE 450 4MATIC",
    price: 83400,
    year: 2023,
    image:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1000&q=80&fit=crop",
      "https://images.unsplash.com/photo-1493238792000-8113da705763?w=1000&q=80",
    ],
    mileage_km: 22800,
    fuel: "Petrol",
    transmission: "9G-TRONIC",
    engine: "3.0L I6 turbo mild hybrid",
    power_hp: 381,
    color: "Selenite Grey",
    body_type: "SUV",
    description:
      "AIRMATIC suspension, Burmester sound, 360 camera and advanced driver assist package.",
    sold_out: 0,
  },
];

async function seedSampleCarsIfEmpty(pool) {
  const [[row]] = await pool.query("SELECT COUNT(*) AS c FROM cars");
  const currentCount = Number(row.c);
  if (currentCount >= 10) {
    return;
  }
  const missing = 10 - currentCount;
  const [existingRows] = await pool.query("SELECT name FROM cars");
  const existingNames = new Set(existingRows.map((x) => x.name));
  const candidates = SAMPLES.filter((s) => !existingNames.has(s.name)).slice(
    0,
    missing
  );
  if (candidates.length === 0) return;

  const sql = `INSERT INTO cars (
    name, price, year, image, created_by,
    mileage_km, fuel, transmission, engine, power_hp, color, body_type, description,
    gallery, sold_out
  ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  for (const s of candidates) {
    const galleryJson =
      s.gallery && s.gallery.length ? JSON.stringify(s.gallery) : null;
    await pool.query(sql, [
      s.name,
      s.price,
      s.year,
      s.image,
      s.mileage_km,
      s.fuel,
      s.transmission,
      s.engine,
      s.power_hp,
      s.color,
      s.body_type,
      s.description,
      galleryJson,
      s.sold_out ?? 0,
    ]);
  }

  console.log(
    `Sample inventory: inserted ${candidates.length} demo vehicles (target minimum: 10).`
  );
}

/**
 * Keeps sample inventory visuals/specs consistent for existing demo rows.
 * This prevents name/image mismatches after manual edits or old seeds.
 */
async function syncSampleCarsByName(pool) {
  // Do not sync sold_out here: it is operational state (purchase / admin) and must survive restarts.
  const sql = `UPDATE cars SET
    price = ?,
    year = ?,
    image = ?,
    mileage_km = ?,
    fuel = ?,
    transmission = ?,
    engine = ?,
    power_hp = ?,
    color = ?,
    body_type = ?,
    description = ?,
    gallery = ?
  WHERE name = ?`;

  for (const s of SAMPLES) {
    const galleryJson =
      s.gallery && s.gallery.length ? JSON.stringify(s.gallery) : null;
    await pool.query(sql, [
      s.price,
      s.year,
      s.image,
      s.mileage_km,
      s.fuel,
      s.transmission,
      s.engine,
      s.power_hp,
      s.color,
      s.body_type,
      s.description,
      galleryJson,
      s.name,
    ]);
  }
}

module.exports = {
  ensureCarSpecColumns,
  seedSampleCarsIfEmpty,
  syncSampleCarsByName,
};
