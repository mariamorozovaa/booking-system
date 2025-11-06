import ROOMS from "./rooms.js";

let bookings = JSON.parse(localStorage.getItem("booking-system-bookings")) || [];
let selectedRoom = null;

const roomsGrid = document.getElementById("roomsGrid");
const bookingModal = document.getElementById("bookingModal");
const closeModal = document.getElementById("closeModal");
const roomPreview = document.getElementById("roomPreview");
const cancelBooking = document.getElementById("cancelBooking");
const checkInDate = document.getElementById("checkInDate");
const checkOutDate = document.getElementById("checkOutDate");
const btnSubmit = document.querySelector(".btn-submit");
const bookingSummary = document.getElementById("bookingSummary");

const customerName = document.getElementById("customerName");
const customerEmail = document.getElementById("customerEmail");
const customerPhone = document.getElementById("customerPhone");

const bookingsCount = document.getElementById("bookingsCount");
const roomsTabBtn = document.querySelector('.tab-btn[data-tab="rooms"]');
const bookingsTabBtn = document.querySelector('.tab-btn[data-tab="bookings"]');

const bookingsTab = document.getElementById("bookingsTab");
const roomsTab = document.getElementById("roomsTab");

const bookingsList = document.getElementById("bookingsList");
const emptyBookings = document.getElementById("emptyBookings");
const bookingForm = document.getElementById("bookingForm");

const emptyBookingsFilter = document.getElementById("emptyBookingsFilter");
const statusFilter = document.getElementById("statusFilter");

const searchInput = document.getElementById("searchInput");

function createRoomCardHTML(room) {
  return ` 
  <div class="room-card">
    <div class="room-image">${room.image}</div>
    <div class="room-body">
      <div class="room-header">
        <div class="room-name">${room.name}</div>
        <div>
          <div class="room-price">${formatMoney(room.pricePerNight)}</div>
          <div class="room-price-label">Цена за ночь</div>
        </div>
      </div>
      <div class="room-info">
        <span>${room.capacity} гостя</span>
        <span>${room.type} </span>
      </div>
      <div class="room-info">
        <span>${room.description} </span>
      </div>
      <div class="room-amenities">
        ${room.amenities.map((elem) => `<span class="amenity-tag">${elem}</span>`).join("")}
      </div>
      <button class="btn-book" data-id="${room.id}">Забронировать</button>
    </div>
  </div>
    `;
}

function formatMoney(amount) {
  const formatted = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return formatted;
}

function renderRooms() {
  const roomsHTML = ROOMS.map((room) => createRoomCardHTML(room)).join("");
  roomsGrid.innerHTML = roomsHTML;
}
renderRooms();

function openBookingModal(roomId) {
  const room = ROOMS.find((r) => r.id === roomId);

  if (!room) {
    alert("Номер не найден");
    return;
  } else {
    selectedRoom = room;

    roomPreview.innerHTML = `
    <div class="room-image">${room.image}</div>
      <div class="room-body">
        <div class="room-header">
          <div class="room-name">${room.name}</div>
          <div>
            <div class="room-price">${formatMoney(room.pricePerNight)}</div>
            <div class="room-price-label">Цена за ночь</div>
          </div>
        </div>
      </div>
    `;
    defineBookingSummary();
  }
}

roomsGrid.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-book")) {
    const roomId = Number(e.target.dataset.id);
    bookingModal.style.display = "flex";
    openBookingModal(roomId);
  }
});

closeModal.addEventListener("click", () => {
  bookingModal.style.display = "none";
});

bookingModal.addEventListener("click", (e) => {
  if (e.target === bookingModal) {
    bookingModal.style.display = "none";
  }
});

cancelBooking.addEventListener("click", () => {
  bookingModal.style.display = "none";
});

const today = new Date();
checkInDate.value = today.toISOString().split("T")[0];

const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
checkOutDate.value = tomorrow.toISOString().split("T")[0];

checkInDate.min = today.toISOString().split("T")[0];
checkOutDate.min = tomorrow.toISOString().split("T")[0];
bookingsCount.textContent = bookings.filter((b) => b.status !== "cancelled").length;

function catchErrors() {
  const summary = defineBookingSummary();
  if (!checkInDate.value || !checkOutDate.value) {
    bookingSummary.innerHTML = `
    <p style='color:red'><strong>❌ Пожалуйста, выберите даты заезда и выезда</strong></p>`;
    return true;
  } else if (checkInDate.value >= checkOutDate.value) {
    bookingSummary.innerHTML = `
    <p style='color:red'><strong>❌ Дата выезда должна быть позже даты заезда</strong></p>`;
    return true;
  } else if (!summary) {
    bookingSummary.innerHTML = `
    <p style='color:red'><strong>❌ К сожалению, номер занят на выбранные даты</strong></p>`;
    return true;
  } else if (customerName.value.trim() === "" || customerEmail.value.trim() === "" || customerPhone.value.trim() === "") {
    bookingSummary.innerHTML = `
    <p style='color:red'><strong>❌ Введите данные о себе</strong></p>`;
    return true;
  } else {
    return false;
  }
}

btnSubmit.addEventListener("click", (e) => {
  e.preventDefault();

  const hasErrors = catchErrors();
  if (hasErrors) return;

  const summary = defineBookingSummary();
  const currentBooking = {
    id: Math.random().toString(16).slice(2),
    roomId: selectedRoom.id,
    roomName: selectedRoom.name,
    roomIcon: selectedRoom.image,
    nameOfClient: customerName.value,
    emailOfClient: customerEmail.value,
    phoneOfClient: customerPhone.value,
    checkIn: summary[0],
    checkOut: summary[1],
    quantityOfNights: summary[2],
    totalPrice: summary[3],
    status: "pending",
    dateCreateBooking: new Date(),
  };

  bookings.push(currentBooking);
  localStorage.setItem("booking-system-bookings", JSON.stringify(bookings));
  bookings.filter((b) => b.status !== "cancelled").length;

  bookingModal.style.display = "none";

  alert(`
   ✅ Бронирование создано!

   Номер: ${currentBooking.roomName}
   Даты: ${formatDate(currentBooking.checkIn)} - ${formatDate(currentBooking.checkOut)}
   Сумма: ${formatMoney(currentBooking.totalPrice)}

   Статус: Ожидает подтверждения
   `);

  updateBookingsCount();

  emptyBookings.style.display = "none";
  bookingsList.style.display = "flex";
  openBookingsTab();

  filterByStatus("pending");
  statusFilter.value = "pending";
});

function formatDate(date) {
  var options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleString("ru", options);
}

bookingsTabBtn.addEventListener("click", (e) => {
  openBookingsTab(e);
});

function openBookingsTab() {
  roomsTabBtn.classList.remove("active");
  roomsTab.classList.remove("active");

  bookingsTabBtn.classList.add("active");
  bookingsTab.classList.add("active");
  filterByStatus(statusFilter.value);
}

roomsTabBtn.addEventListener("click", () => {
  roomsTabBtn.classList.add("active");
  roomsTab.classList.add("active");
  bookingsTab.classList.remove("active");
  bookingsTabBtn.classList.remove("active");
});

checkOutDate.addEventListener("change", (e) => {
  defineBookingSummary(e);
});
checkInDate.addEventListener("change", (e) => {
  defineBookingSummary(e);
});

function defineBookingSummary() {
  if (!selectedRoom) return;
  const checkInCurr = new Date(checkInDate.value);
  const checkOutCurr = new Date(checkOutDate.value);

  const diffTime = checkOutCurr - checkInCurr;
  const quantityOfNights = diffTime / (1000 * 60 * 60 * 24);
  let priceForNights = selectedRoom.pricePerNight;
  let totalPrice = priceForNights * quantityOfNights;

  if (checkOutCurr < checkInCurr || quantityOfNights <= 0) {
    bookingSummary.innerHTML = `
    <p style='color:red'><strong>❌ Дата выезда должна быть позже даты заезда</strong></p>
`;
    return;
  }

  let roomIsAvailable = true;

  for (let i = 0; i < bookings.length; i++) {
    const bookingRoom = bookings[i];
    if (bookingRoom.status === "cancelled") {
      continue;
    }

    if (bookingRoom.roomId === selectedRoom.id) {
      const existIn = new Date(bookingRoom.checkIn);
      const existOut = new Date(bookingRoom.checkOut);

      const newIn = new Date(checkInDate.value);
      const newOut = new Date(checkOutDate.value);

      if (!checkRoomAvailible(existIn, existOut, newIn, newOut)) {
        roomIsAvailable = false;
      }
    }
  }

  if (!roomIsAvailable) {
    bookingSummary.innerHTML = `
    <p style='color:red'><strong>❌ К сожалению, номер занят на выбранные даты</strong></p>
`;
    return;
  }

  bookingSummary.innerHTML = `
      <p>Количество ночей:</strong> ${quantityOfNights}</p>
      <p>Цена за ночь: ${formatMoney(priceForNights)}</p>
      <p>────────────────────────</p>
      <p>Итого: ${formatMoney(totalPrice)}</p><br>
      <p>✅ Номер доступен на выбранные даты</p>
  `;

  return [checkInCurr, checkOutCurr, quantityOfNights, totalPrice];
}

function checkRoomAvailible(existDateIn, existDateOut, checkDateIn, checkDateOut) {
  if (existDateIn <= checkDateOut && existDateOut >= checkDateIn) {
    return false;
  }
  return true;
}

function updateBookingsCount() {
  bookingsCount.textContent = bookings.filter((b) => b.status !== "cancelled").length;
}

function createBookingCardHTML(bookingsCard) {
  return ` 
  <div class="booking-card ${bookingsCard.status}" data-id="${bookingsCard.id}">
        <div class="booking-header">
          <div class="booking-icon">${bookingsCard.roomIcon}</div>
          <div class="booking-room-name">${bookingsCard.roomName}</div>
          <div class="booking-dates">
            ${formatDate(new Date(bookingsCard.checkIn))} - ${formatDate(new Date(bookingsCard.checkOut))}
          </div>
          <div class="booking-status">${
            bookingsCard.status === "pending"
              ? "⏳ Ожидает подтверждения"
              : bookingsCard.status === "confirmed"
              ? "✅ Подтверждено"
              : bookingsCard.status === "cancelled"
              ? "❌ Отменено"
              : ""
          } </div>
        </div>
        <div class="booking-body">
          <span>Клиент: ${bookingsCard.nameOfClient}</span>
          <span>Email: ${bookingsCard.emailOfClient}</span>
          <span>Телефон: ${bookingsCard.phoneOfClient}</span>
          <span>Ночей: ${bookingsCard.quantityOfNights}</span>
          <span>Стоимость: ${bookingsCard.totalPrice}</span>
        </div>

        <div class="booking-actions">
        ${
          bookingsCard.status === "pending"
            ? `<button class="btn-action btn-confirm">✅ Подтвердить</button>
          <button class="btn-action btn-cancel-booking">❌ Отменить</button>`
            : bookingsCard.status === "confirmed"
            ? `<button class="btn-action btn-cancel-booking">❌ Отменить</button>`
            : ``
        }
        </div>
    </div>
    `;
}

bookingsList.addEventListener("click", function (e) {
  const card = e.target.closest(".booking-card");
  if (!card) return;

  const bookingId = card.dataset.id;
  const bookingIndex = bookings.findIndex((b) => b.id === bookingId);
  if (bookingIndex === -1) return;

  if (e.target.classList.contains("btn-confirm")) {
    bookings[bookingIndex].status = "confirmed";
    saveAndRenderBookings();
    updateBookingsCount();
    alert(`
    ✅ Бронирование подтверждено!

   ${bookings[bookingIndex].roomName}
   ${bookings[bookingIndex].nameOfClient}
   `);
  }

  if (e.target.classList.contains("btn-cancel-booking")) {
    const confirmCancel = confirm(`
    Отменить бронирование?

    ${bookings[bookingIndex].roomName}
    ${bookings[bookingIndex].nameOfClient}
    ${formatDate(new Date(bookings[bookingIndex].checkIn))} - ${formatDate(new Date(bookings[bookingIndex].checkOut))} `);

    if (confirmCancel) {
      bookings[bookingIndex].status = "cancelled";
      saveAndRenderBookings();
      updateBookingsCount();
      alert("❌ Бронирование отменено");
    }
  }
});

customerName.addEventListener("change", () => {
  if (!customerName.value) {
    bookingSummary.innerHTML = `❌ Введите имя и фамилию`;
  } else defineBookingSummary();
});

customerEmail.addEventListener("change", () => {
  if (!customerEmail.value) {
    bookingSummary.innerHTML = `❌ Введите Email`;
  } else defineBookingSummary();
});

customerPhone.addEventListener("change", () => {
  if (!customerPhone.value) {
    bookingSummary.innerHTML = `❌ Введите номер телефона`;
  } else defineBookingSummary();
});

function saveAndRenderBookings() {
  localStorage.setItem("booking-system-bookings", JSON.stringify(bookings));
  updateBookingsCount();
  filterByStatus(statusFilter.value);
}

function renderBookings() {
  const sorted = sortBookingsByDate(bookings);
  const bookingsHTML = sorted.map(createBookingCardHTML).join("");
  bookingsList.innerHTML = bookingsHTML;
}

function filterByStatus(status) {
  let filtered = bookings;

  if (status !== "all") {
    filtered = bookings.filter((b) => b.status === status);
  }

  if (bookings.length === 0) {
    bookingsList.style.display = "none";
    emptyBookings.style.display = "block";
    return;
  }

  if (filtered.length === 0) {
    bookingsList.style.display = "none";
    emptyBookings.style.display = "block";
    emptyBookings.querySelector("p").textContent = "📊 Нет бронирований для отображения";
    return;
  }
  emptyBookings.style.display = "none";
  bookingsList.style.display = "flex";
  const sorted = sortBookingsByDate(filtered);
  bookingsList.innerHTML = sorted.map(createBookingCardHTML).join("");
}

statusFilter.addEventListener("change", (e) => {
  filterByStatus(e.target.value);
});

function sortBookingsByDate(bookings) {
  return bookings.slice().sort((a, b) => {
    return new Date(b.dateCreateBooking) - new Date(a.dateCreateBooking);
  });
}
