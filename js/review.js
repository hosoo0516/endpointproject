// 1. API 기본 주소 설정
const BASE_URL = "http://teacherdev09.kro.kr:10002";

// 2. URL 파라미터에서 상품 ID(productId) 추출
function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("productId") || params.get("id") || "1"; // 없을 경우 테스트용 기본값 1
}

// 3. 서버에서 리뷰 목록 가져오기 (GET)
async function fetchReviews(productId) {
  const container = document.getElementById("review-list-container");
  container.innerHTML = "<p>리뷰를 불러오는 중입니다...</p>";

  try {
    const response = await fetch(
      `${BASE_URL}/api/products/${productId}/reviews`,
    );
    const result = await response.json();

    if (result.success) {
      renderReviews(result.data);
    } else {
      container.innerHTML = `<p>${result.message || "리뷰를 불러오지 못했습니다."}</p>`;
    }
  } catch (error) {
    console.error("리뷰 조회 에러:", error);
    container.innerHTML = "<p>서버 통신 중 오류가 발생했습니다.</p>";
  }
}

// 4. 받아온 리뷰 목록을 화면에 카드 형태로 렌더링
function renderReviews(reviewList) {
  const container = document.getElementById("review-list-container");

  if (!reviewList || reviewList.length === 0) {
    container.innerHTML = "<p>아직 작성된 리뷰가 없습니다.</p>";
    return;
  }

  container.innerHTML = reviewList
    .map(
      (review) => `
    <div class="review-card">
      <div class="review-header">
        <strong>${review.userName || "익명"}</strong> 
        <span>★ ${review.rating}점</span>
      </div>
      <p class="review-content">${review.content}</p>
      <small class="review-date">${review.createdAt ? review.createdAt.split("T")[0] : ""}</small>
    </div>
  `,
    )
    .join("");
}

// 5. 리뷰 작성 폼 제출 처리 (POST)
async function handleReviewSubmit(e) {
  e.preventDefault();

  // 5-1. 로그인 여부 확인
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("로그인이 필요한 기능입니다.");
    return;
  }

  // 5-2. 입력값 확인
  const productId = getProductId();
  const rating = document.getElementById("rating").value;
  const content = document.getElementById("content").value.trim();

  if (!content) {
    alert("리뷰 내용을 입력해주세요.");
    return;
  }

  // 5-3. API 요청 전송
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
      document.getElementById("content").value = ""; // 입력창 비우기
      fetchReviews(productId); // [중요] 새로고침 없이 즉시 목록 재조회
    } else {
      alert(result.message || "리뷰 등록에 실패했습니다.");
    }
  } catch (error) {
    console.error("리뷰 등록 에러:", error);
    alert("서버 요청 중 오류가 발생했습니다.");
  }
}

// 6. 페이지 열릴 때 이벤트 연결 및 초기 데이터 로드
document.addEventListener("DOMContentLoaded", () => {
  const currentProductId = getProductId();

  // 최초 리뷰 목록 로드
  fetchReviews(currentProductId);

  // 폼 submit 이벤트 연결
  const reviewForm = document.getElementById("review-form");
  if (reviewForm) {
    reviewForm.addEventListener("submit", handleReviewSubmit);
  }
});
