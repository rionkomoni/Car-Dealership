import { MemoryRouter } from "react-router-dom";
import CarCard from "./CarCard";

const sampleCar = {
  id: 1,
  name: "Audi Q8",
  year: 2022,
  price: 62000,
  mileage_km: 45000,
  fuel: "Diesel",
  power_hp: 286,
  image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&q=80",
  sold_out: 0,
};

export default {
  title: "Showroom/CarCard",
  component: CarCard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ maxWidth: 320 }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export const Available = {
  args: { car: sampleCar },
};

export const SoldOut = {
  args: {
    car: { ...sampleCar, sold_out: 1 },
  },
};
