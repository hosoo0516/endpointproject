const BASE_URL = "http://teacherdev09.kro.kr:10002";

// 1. URL 쿼리스트링에서 productId 추출 (상세 페이지에서 ?productId=123 형태로 넘어올 때)
function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("productId") || params.get("id") || "1";
}

// 2. 무신사/배민 스타일 날짜 변환 함수
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

  // 7일 이상 지나면 YYYY.MM.DD 형태로 출력
  const year = past.getFullYear();
  const month = String(past.getMonth() + 1).padStart(2, "0");
  const day = String(past.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

// 3. 리뷰 목록 조회 (GET API)
async function fetchReviews(productId) {
  const container = document.getElementById("review-list-container");

  // 기존 목록 비우기 (innerHTML 대신 textContent 사용)
  container.textContent = "";

  const loadingMsg = document.createElement("p");
  loadingMsg.textContent = "리뷰를 불러오는 중입니다...";
  container.appendChild(loadingMsg);

  try {
    const response = await fetch(
      `${BASE_URL}/api/products/${productId}/reviews`,
    );
    const result = await response.json();

    container.textContent = ""; // 로딩 문구 제거

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

// 4. 리뷰 목록을 순수 DOM 생성 방식으로 화면에 렌더링 (innerHTML X)
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
    // 카드 박스 생성 (<div class="review-card">)
    const card = document.createElement("div");
    card.className = "review-card";

    // 카드 상단 헤더 (<div class="review-header">)
    const header = document.createElement("div");
    header.className = "review-header";

    // 작성자 이름 (<strong>)
    const authorSpan = document.createElement("strong");
    authorSpan.textContent = item.userName || "익명 구매자";

    // 평점 별점 표시 (<span>)
    const ratingSpan = document.createElement("span");
    const stars = "★".repeat(item.rating) + "☆".repeat(5 - item.rating);
    ratingSpan.textContent = ` ${stars} (${item.rating}점)`;
    ratingSpan.style.color = "#f59e0b"; // 노란 별점 색상

    // 작성일자 (<small>)
    const dateSpan = document.createElement("small");
    dateSpan.className = "review-date";
    dateSpan.textContent = formatDate(item.createdAt);

    header.appendChild(authorSpan);
    header.appendChild(ratingSpan);
    header.appendChild(dateSpan);

    // 리뷰 내용 (<p class="review-content">)
    const contentP = document.createElement("p");
    contentP.className = "review-content";
    contentP.textContent = item.content;

    // 카드에 헤더와 본문 추가
    card.appendChild(header);
    card.appendChild(contentP);

    // 최종 컨테이너에 카드 추가
    container.appendChild(card);
  });
}

// 5. 리뷰 등록 처리 (POST API)
async function handleReviewSubmit(e) {
  e.preventDefault();

  // 1) 로그인 여부(토큰) 확인
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("로그인이 필요한 기능입니다.");
    return;
  }

  // 2) 입력 데이터 가져오기
  const productId = getProductId();
  const rating = document.getElementById("rating").value;
  const contentInput = document.getElementById("content");
  const content = contentInput.value.trim();

  if (!content) {
    alert("리뷰 내용을 입력해주세요.");
    return;
  }

  // 3) 백엔드 API 요청
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
      contentInput.value = ""; // 입력창 비우기

      // [요구사항] 등록 성공 후 즉시 목록 재조회하여 새 리뷰 갱신
      fetchReviews(productId);
    } else {
      alert(result.message || "리뷰 등록에 실패했습니다.");
    }
  } catch (error) {
    console.error("리뷰 등록 에러:", error);
    alert("리뷰 등록 요청 중 오류가 발생했습니다.");
  }
}

// 6. 초기 실행
document.addEventListener("DOMContentLoaded", () => {
  const currentProductId = getProductId();

  // 상품 ID로 리뷰 목록 로드
  fetchReviews(currentProductId);

  // 폼 제출 이벤트 바인딩
  const form = document.getElementById("review-form");
  if (form) {
    form.addEventListener("submit", handleReviewSubmit);
  }
});
