import ROOMS from "./rooms.js";

let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
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
    bookingSummary.innerHTML = `
        <p><strong>✅ Номер доступен на выбранные даты</strong></p>
        <p>Количество ночей: ${1}</p>
        <p>Цена за ночь: ${formatMoney(room.pricePerNight)}</p>
        <p>Итого: ${formatMoney(room.pricePerNight * 1)}</p>
    `;
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
  closeTheModal();
});

bookingModal.addEventListener("click", (e) => {
  if (e.target === bookingModal) {
    closeTheModal();
  }
});

cancelBooking.addEventListener("click", () => {
  closeTheModal();
});

function closeTheModal() {
  bookingModal.style.display = "none";
}

const today = new Date();
checkInDate.value = today.toISOString().split("T")[0];

const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
checkOutDate.value = tomorrow.toISOString().split("T")[0];

checkInDate.min = today.toISOString().split("T")[0];
checkOutDate.min = tomorrow.toISOString().split("T")[0];
bookingsCount.textContent = bookings.filter((b) => b.status !== "cancelled").length;

function catchErrors() {
  if (!checkInDate.value || !checkOutDate.value) {
    alert("❌ Пожалуйста, выберите даты заезда и выезда");
    return true;
  } else if (checkInDate.value >= checkOutDate.value) {
    // checkInDate.value = today.toISOString().split("T")[0];
    alert("❌ Дата выезда должна быть позже даты заезда");
    return true;
  }
  // else if () {
  //   alert("❌ К сожалению, номер занят на выбранные даты");
  //   return true;
  // }
  else {
    return false;
  }
}

btnSubmit.addEventListener("click", (e) => {
  e.preventDefault();
  bookingForm.checkValidity(); //не работает

  const hasErrors = catchErrors();
  if (hasErrors) return;

  const currentBooking = {
    id: Math.random().toString(16).slice(2),
    roomId: selectedRoom.id,
    roomName: selectedRoom.name,
    roomIcon: selectedRoom.image,
    nameOfClient: customerName.value,
    emailOfClient: customerEmail.value,
    phoneOfClient: customerPhone.value,
    checkIn: defineBookingSummary()[0],
    checkOut: defineBookingSummary()[1],
    quantityOfNights: defineBookingSummary()[2],
    totalPrice: defineBookingSummary()[3],
    status: "pending",
    dateCreateBooking: new Date(),
  };

  if (currentBooking.nameOfClient && currentBooking.emailOfClient && currentBooking.phoneOfClient) {
    bookings.push(currentBooking);
    localStorage.setItem("bookings", JSON.stringify(bookings));
    bookingsCount.textContent = bookings.length;

    closeTheModal();
    alert(`
   ✅ Бронирование создано!

   Номер: ${currentBooking.roomName}
   Даты: ${formatDate(currentBooking.checkIn)} - ${formatDate(currentBooking.checkOut)}
   Сумма: ${formatMoney(currentBooking.totalPrice)}

   Статус: Ожидает подтверждения
   `);

    const bookingsArr = localStorage.getItem("bookings");

    updateBookingsCount();

    emptyBookings.style.display = "none";
    bookingsList.style.display = "flex";
    roomsTabBtn.classList.remove("active");
    bookingsTabBtn.classList.add("active");

    roomsTab.classList.remove("active");
    bookingsTab.classList.add("active");

    renderBookings(bookingsArr);
  } else {
    emptyBookings.style.display = "flex";
    alert("❌ Введите данные о себе");
    //сделать другую проверку
  }
});

function formatDate(date) {
  var options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleString("ru", options);
}

bookingsTabBtn.addEventListener("click", () => {
  roomsTabBtn.classList.remove("active");
  roomsTab.classList.remove("active");
  bookingsTab.classList.add("active");
  bookingsTabBtn.classList.add("active");
});

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
  const checkOutCurr = new Date(checkOutDate.value);
  const checkInCurr = new Date(checkInDate.value);

  const diffTime = checkOutCurr - checkInCurr;
  const quantityOfNights = diffTime / (1000 * 60 * 60 * 24);
  let priceForNights = selectedRoom.pricePerNight;
  let totalPrice = priceForNights * quantityOfNights;

  bookingSummary.innerHTML = `
    <p><strong>✅ Номер доступен на выбранные даты</strong></p>
    <p>Количество ночей:</strong> ${quantityOfNights}</p>
    <p>Цена за ночь: ${formatMoney(priceForNights)}</p>
    <p>Итого: ${formatMoney(totalPrice)}</p>
`;

  if (checkOutCurr < checkInCurr) {
    bookingSummary.innerHTML = `
    <p><strong>❌ Дата выезда должна быть позже даты заезда</strong></p>
`;
  }

  return [checkInCurr, checkOutCurr, quantityOfNights, totalPrice];
}

function checkRoomAvailible([existDateIn, existDateOut], [checkDateIn, checkDateOut]) {
  if (existDateIn < checkDateOut && existDateOut > checkDateIn) {
    alert("❌ Бронирование невозможно");
    return false;
  }
  return true;
}

function editBookingsState() {
  const bookingsArr = localStorage.getItem("bookings");
  if (bookings.length === 0) {
    emptyBookings.style.display = "block";
    bookingsList.style.display = "none";
  } else {
    emptyBookings.style.display = "none";
    bookingsList.style.display = "flex";
    renderBookings(bookingsArr);
  }
}

function updateBookingsCount() {
  bookingsCount.textContent = bookings.filter((b) => b.status !== "cancelled").length;
}

bookingsTabBtn.addEventListener("click", editBookingsState);

function createBookingCardHTML(bookingsCard) {
  return ` 
  <div class="booking-card ${bookingsCard.status}">
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

function renderBookings() {
  const bookingsHTML = bookings.map((booking) => createBookingCardHTML(booking)).join("");
  bookingsList.innerHTML = bookingsHTML;
}

bookingsList.addEventListener("click", (e) => {
  const bookingCardEl = e.target.closest(".booking-card");
  const bookingIndex = Array.from(bookingsList.children).indexOf(bookingCardEl);

  if (e.target.classList.contains("btn-confirm")) {
    bookings[bookingIndex].status = "confirmed";
    saveAndRenderBookings();
    alert(`✅ Бронирование подтверждено!

   ${bookings[bookingIndex].roomName}
   ${bookings[bookingIndex].nameOfClient}`);
  }

  if (e.target.classList.contains("btn-cancel-booking")) {
    const confirmCancelBooking = confirm(`Отменить бронирование?

   ${bookings[bookingIndex].roomName}
   ${bookings[bookingIndex].nameOfClient}
   ${formatDate(new Date(bookings[bookingIndex].checkIn))} - ${formatDate(new Date(bookings[bookingIndex].checkOut))}`);
    if (confirmCancelBooking) {
      bookings[bookingIndex].status = "cancelled";
      saveAndRenderBookings();
      updateBookingsCount();
      alert("❌ Бронирование отменено");
    } else {
      return;
    }
  }
});

function saveAndRenderBookings() {
  localStorage.setItem("bookings", JSON.stringify(bookings));
  renderBookings();
}
