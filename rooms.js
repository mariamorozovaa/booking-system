// ========================================
// БАЗА ДАННЫХ НОМЕРОВ
// ========================================

const ROOMS = [
  {
    id: 1,
    name: "Стандартный номер",
    type: "standard",
    capacity: 2,
    pricePerNight: 3000,
    description: "Уютный номер с видом на город",
    image: "🛏️",
    amenities: ["Wi-Fi", "TV", "Кондиционер", "Мини-бар"],
  },
  {
    id: 2,
    name: "Люкс",
    type: "deluxe",
    capacity: 3,
    pricePerNight: 5500,
    description: "Просторный номер с балконом",
    image: "🏨",
    amenities: ["Wi-Fi", "Smart TV", "Кондиционер", "Мини-бар", "Джакузи", "Балкон"],
  },
  {
    id: 3,
    name: "Семейный номер",
    type: "family",
    capacity: 4,
    pricePerNight: 7000,
    description: "Идеален для семейного отдыха",
    image: "👨‍👩‍👧‍👦",
    amenities: ["Wi-Fi", "Smart TV", "Кондиционер", "Мини-бар", "Кухня", "2 спальни"],
  },
  {
    id: 4,
    name: "Президентский люкс",
    type: "presidential",
    capacity: 4,
    pricePerNight: 15000,
    description: "Роскошный номер с панорамным видом",
    image: "👑",
    amenities: ["Wi-Fi", "Smart TV", "Кондиционер", "Мини-бар", "Джакузи", "Балкон", "Камин", "Кабинет"],
  },
];

export default ROOMS;
