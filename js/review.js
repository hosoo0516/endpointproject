const BASE_URL = "http://teacherdev09.kro.kr:10002";
function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("productId") || params.get("id") || "1";
}
function formatDate(dateString) {
  if (!dateString) return "방금 전";
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);
  if (diffInSeconds < 60) return "방금 전";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}일 전`;

  const year = past.getFullYear();
  const month = String(past.getMonth() + 1).padStart(2, "0");
  const day = String(past.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

async function fetchReviews(productId) {
  const container = document.getElementById("review-list-container");

  container.textContent = "";

  const loadingMsg = document.createElement("p");
  loadingMsg.textContent = "리뷰를 불러오는 중입니다...";
  container.appendChild(loadingMsg);

  try {
    const response = await fetch(
      `${BASE_URL}/api/products/${productId}/reviews`,
    );
    const result = await response.json();

    container.textContent = "";

    if (result.success && result.data) {
      renderReviews(result.data);
    } else {
      const errorMsg = document.createElement("p");
      errorMsg.textContent = result.message || "리뷰를 불러오지 못했습니다.";
      container.appendChild(errorMsg);
    }
  } catch (error) {
    console.error("리뷰 조회 에러:", error);
    container.textContent = "";
    const errorMsg = document.createElement("p");
    errorMsg.textContent = "서버 통신 중 오류가 발생했습니다.";
    container.appendChild(errorMsg);
  }
}

function renderReviews(reviewList) {
  const container = document.getElementById("review-list-container");
  container.textContent = "";

  if (!reviewList || reviewList.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = "작성된 리뷰가 없습니다. 첫 리뷰를 작성해보세요!";
    container.appendChild(emptyMsg);
    return;
  }

  reviewList.forEach((item) => {
    const card = document.createElement("div");
    card.className = "review-card";
    const header = document.createElement("div");
    header.className = "review-header";

    const authorSpan = document.createElement("strong");
    authorSpan.textContent = item.userName || "익명 구매자";

    const ratingSpan = document.createElement("span");
    const stars = "★".repeat(item.rating) + "☆".repeat(5 - item.rating);
    ratingSpan.textContent = ` ${stars} (${item.rating}점)`;
    ratingSpan.style.color = "#f59e0b"; // 노란 별점 색상

    const dateSpan = document.createElement("small");
    dateSpan.className = "review-date";
    dateSpan.textContent = formatDate(item.createdAt);

    header.appendChild(authorSpan);
    header.appendChild(ratingSpan);
    header.appendChild(dateSpan);

    const contentP = document.createElement("p");
    contentP.className = "review-content";
    contentP.textContent = item.content;

    card.appendChild(header);
    card.appendChild(contentP);

    container.appendChild(card);
  });
}

async function handleReviewSubmit(e) {
  e.preventDefault();

  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("로그인이 필요한 기능입니다.");

    document.getElementById("review-form").reset();

    return;
  }

  const productId = getProductId();
  const rating = document.getElementById("rating").value;
  const contentInput = document.getElementById("content");
  const content = contentInput.value.trim();

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
          content: content,
        }),
      },
    );

    const result = await response.json();

    if (result.success) {
      alert("리뷰가 성공적으로 등록되었습니다.");
      contentInput.value = "";
      fetchReviews(productId);
    } else {
      alert(result.message || "리뷰 등록에 실패했습니다.");
    }
  } catch (error) {
    console.error("리뷰 등록 에러:", error);
    alert("리뷰 등록 요청 중 오류가 발생했습니다.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const currentProductId = getProductId();

  fetchReviews(currentProductId);
  const form = document.getElementById("review-form");
  if (form) {
    form.addEventListener("submit", handleReviewSubmit);
  }
});
