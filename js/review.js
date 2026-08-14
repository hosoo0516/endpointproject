const BASE_URL = "http://teacherdev09.kro.kr:10002";

function getProductId() {
  const params = new URLSearchParams(location.search);
  return params.get("productId") || params.get("id") || "1";
}

function formatDate(dateString) {
  if (!dateString) return "방금 전";

  const now = new Date();
  const past = new Date(dateString);
  const diff = Math.floor((now - past) / 1000);

  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

  return past.toISOString().slice(0, 10).replace(/-/g, ".");
}

async function fetchReviews(productId) {
  const container = document.getElementById("review-list-container");

  container.textContent = "";

  const loading = document.createElement("p");
  loading.textContent = "리뷰를 불러오는 중입니다...";
  container.appendChild(loading);

  try {
    const response = await fetch(
      `${BASE_URL}/api/products/${productId}/reviews`,
    );

    const result = await response.json();

    container.textContent = "";

    if (!result.success) {
      const msg = document.createElement("p");
      msg.textContent = result.message || "리뷰 조회에 실패했습니다.";
      container.appendChild(msg);
      return;
    }

    renderReviews(result.data || []);
  } catch (error) {
    container.textContent = "";

    const msg = document.createElement("p");
    msg.textContent = "서버 통신 중 오류가 발생했습니다.";
    container.appendChild(msg);
  }
}

function renderReviews(reviewList) {
  const container = document.getElementById("review-list-container");

  container.textContent = "";

  if (reviewList.length === 0) {
    const msg = document.createElement("p");
    msg.textContent = "작성된 리뷰가 없습니다.";
    container.appendChild(msg);
    return;
  }

  reviewList.forEach((item) => {
    const card = document.createElement("div");
    card.className = "review-card";

    const header = document.createElement("div");
    header.className = "review-header";

    const author = document.createElement("strong");
    author.textContent = item.userName;

    const rating = document.createElement("span");
    rating.textContent =
      "★".repeat(item.rating) +
      "☆".repeat(5 - item.rating) +
      ` (${item.rating}점)`;
    rating.style.color = "#f59e0b";

    const date = document.createElement("small");
    date.className = "review-date";
    date.textContent = formatDate(item.createdAt);

    header.append(author, rating, date);

    const content = document.createElement("p");
    content.className = "review-content";
    content.textContent = item.content;

    card.append(header, content);
    container.appendChild(card);
  });
}

async function handleReviewSubmit(e) {
  e.preventDefault();

  const token = localStorage.getItem("accessToken");

  if (!token) {
    alert("로그인이 필요한 기능입니다.");
    location.href = "login.html";
    return;
  }

  const productId = getProductId();
  const rating = document.getElementById("rating").value;
  const content = document.getElementById("content").value.trim();

  if (!rating) {
    alert("평점을 선택해주세요.");
    return;
  }

  if (!content) {
    alert("리뷰 내용을 입력해주세요.");
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/api/products/${productId}/reviews`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: Number(rating),
          content,
        }),
      },
    );

    const result = await response.json();

    if (!result.success) {
      alert(result.message || "리뷰 등록에 실패했습니다.");
      return;
    }

    alert(result.message || "리뷰가 등록되었습니다.");

    document.getElementById("review-form").reset();

    fetchReviews(productId);
  } catch (error) {
    alert("리뷰 등록 중 오류가 발생했습니다.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const productId = getProductId();

  fetchReviews(productId);

  document
    .getElementById("review-form")
    .addEventListener("submit", handleReviewSubmit);
});
