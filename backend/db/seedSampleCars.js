/**
 * Adds spec columns to `cars` (safe if already present) and seeds demo rows when empty.
 * Demo set: BMW, Audi, and Mercedes only (three of each), all different models.
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

const SAMPLES = [
  // —— BMW ——
  {
    name: "BMW M4 Competition",
    price: 78500,
    year: 2023,
    image:
      "https://images.unsplash.com/photo-1617814076367-b75995f65d1c?w=800&q=80",
    mileage_km: 18200,
    fuel: "Petrol",
    transmission: "8-speed M Steptronic",
    engine: "3.0L I6 twin-turbo",
    power_hp: 503,
    color: "Isle of Man Green",
    body_type: "Coupe",
    description:
      "M xDrive, carbon roof, adaptive M suspension. Track-ready coupe with everyday usability.",
  },
  {
    name: "BMW X5 xDrive40i",
    price: 72900,
    year: 2023,
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    mileage_km: 24800,
    fuel: "Petrol",
    transmission: "8-speed automatic",
    engine: "3.0L I6 turbo mild hybrid",
    power_hp: 381,
    color: "Mineral White",
    body_type: "SUV",
    description:
      "Panoramic roof, Vernasca leather, Driving Assistant Professional. Spacious luxury SUV.",
  },
  {
    name: "BMW i4 M50",
    price: 66900,
    year: 2024,
    image:
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80",
    mileage_km: 6200,
    fuel: "Electric",
    transmission: "Single-speed",
    engine: "Dual motor AWD",
    power_hp: 544,
    color: "Portimao Blue",
    body_type: "Gran Coupe",
    description:
      "M adaptive suspension, IconicSounds Electric, long range. Silent M performance.",
  },
  // —— Audi ——
  {
    name: "Audi RS6 Avant performance",
    price: 125000,
    year: 2023,
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
    mileage_km: 14100,
    fuel: "Petrol",
    transmission: "8-speed Tiptronic",
    engine: "4.0L V8 twin-turbo",
    power_hp: 630,
    color: "Nardo Gray",
    body_type: "Wagon",
    description:
      "Quattro sport diff, RS sport exhaust, panoramic roof. The ultimate fast family wagon.",
  },
  {
    name: "Audi Q8 55 TFSI quattro",
    price: 78900,
    year: 2022,
    image:
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80",
    mileage_km: 38900,
    fuel: "Petrol",
    transmission: "8-speed automatic",
    engine: "3.0L V6 turbo mild hybrid",
    power_hp: 340,
    color: "Navarra Blue",
    body_type: "SUV",
    description:
      "HD Matrix LED, air suspension, Valcona leather. Coupe-SUV presence with quattro grip.",
  },
  {
    name: "Audi e-tron GT quattro",
    price: 104900,
    year: 2023,
    image:
      "https://images.unsplash.com/photo-1614200187524-dc4118d55aa8?w=800&q=80",
    mileage_km: 9200,
    fuel: "Electric",
    transmission: "2-speed (rear)",
    engine: "Dual asynchronous motors",
    power_hp: 476,
    color: "Daytona Gray",
    body_type: "Gran Turismo",
    description:
      "800V charging, adaptive air suspension, laser-light option. Audi’s electric grand tourer.",
  },
  // —— Mercedes ——
  {
    name: "Mercedes-AMG C63 S",
    price: 71800,
    year: 2022,
    image:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    mileage_km: 34100,
    fuel: "Petrol",
    transmission: "9-speed AMG Speedshift",
    engine: "4.0L V8 biturbo",
    power_hp: 503,
    color: "Obsidian Black",
    body_type: "Sedan",
    description:
      "AMG Performance seats, Burmester 3D, rear-axle steering. Thundering V8 executive.",
  },
  {
    name: "Mercedes-AMG EQS 53 4MATIC+",
    price: 132000,
    year: 2023,
    image:
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80",
    mileage_km: 11200,
    fuel: "Electric",
    transmission: "Single-speed",
    engine: "Dual motor AMG",
    power_hp: 658,
    color: "High-Tech Silver",
    body_type: "Sedan",
    description:
      "Hyperscreen, AMG Ride Control+, rear-wheel steering. Silent flagship with AMG edge.",
  },
  {
    name: "Mercedes-AMG GLA 45 S",
    price: 58900,
    year: 2023,
    image:
      "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&q=80",
    mileage_km: 19500,
    fuel: "Petrol",
    transmission: "8-speed DCT",
    engine: "2.0L I4 turbo",
    power_hp: 421,
    color: "Sun Yellow",
    body_type: "SUV",
    description:
      "AMG Performance 4MATIC+, sport exhaust, MBUX. Compact SUV with hyper-hatch pace.",
  },
];

async function seedSampleCarsIfEmpty(pool) {
  const [[row]] = await pool.query("SELECT COUNT(*) AS c FROM cars");
  if (Number(row.c) > 0) {
    return;
  }

  const sql = `INSERT INTO cars (
    name, price, year, image, created_by,
    mileage_km, fuel, transmission, engine, power_hp, color, body_type, description
  ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)`;

  for (const s of SAMPLES) {
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
    ]);
  }

  console.log(
    `Sample inventory: inserted ${SAMPLES.length} BMW / Audi / Mercedes vehicles (empty table).`
  );
}

module.exports = {
  ensureCarSpecColumns,
  seedSampleCarsIfEmpty,
};
