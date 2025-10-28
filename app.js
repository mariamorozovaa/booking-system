import ROOMS from "./rooms.js";

let bookings = [];
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
const bookingsTab = document.getElementById("bookingsTab");
const bookingsCount = document.getElementById("bookingsCount");
const statusFilter = document.getElementById("statusFilter");
const searchInput = document.getElementById("searchInput");
const bookingsList = document.getElementById("bookingsList");
const emptyBookings = document.getElementById("emptyBookings");
const bookingForm = document.getElementById("bookingForm");

const tabBtnChoice = document.querySelectorAll(".tab-btn");

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
    <p>Количество ночей: 1</p>
    <p>Цена за ночь: ${formatMoney(room.pricePerNight)}</p>
    <p>Итого: ${formatMoney(room.pricePerNight)}</p>
`;
  }
}

const btnBook = document.querySelectorAll(".btn-book");

btnBook.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    bookingModal.style.display = "flex";
    const roomId = Number(e.target.dataset.id);
    openBookingModal(roomId);
  });
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

// customerName
// customerEmail
// customerPhone

function catchErrors() {
  if (!checkInDate.value || !checkOutDate.value) {
    alert("❌ Пожалуйста, выберите даты заезда и выезда");
    return true;
  } else if (checkInDate.value >= checkOutDate.value) {
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
  const hasErrors = catchErrors();
  if (hasErrors) return;

  const checkInCurr = new Date(checkInDate.value);
  const checkOutCurr = new Date(checkOutDate.value);

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
});
