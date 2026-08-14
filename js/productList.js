const BASE_URL = "http://teacherdev09.kro.kr:10002/endpoint";

async function loadProducts(keyword = "", category = "") {
  const container = document.getElementById("product-container");

  let url = `${BASE_URL}/api/products?page=0&size=50&sort=id,desc`;
  if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;

  const response = await fetch(url);
  const result = await response.json();
  const productList = result.data.content;

  container.innerHTML = "";

  if (!productList || productList.length === 0) {
    container.innerHTML = '<p class="message-box">조회된 상품이 없습니다.</p>';
    return;
  }

  productList.forEach((item) => {
    const card = document.createElement("div");
    card.className = "product-card";

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = item.category;

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = item.name;

    const price = document.createElement("div");
    price.className = "price";
    price.textContent = `${item.price.toLocaleString()}원`;

    const stock = document.createElement("div");
    stock.className = "stock";
    stock.textContent = `남은 수량: ${item.stockQuantity}개`;

    card.addEventListener("click", () => {
      location.href = `ProductInfo.html?id=${item.id}`;
    });

    card.appendChild(badge);
    card.appendChild(title);
    card.appendChild(price);
    card.appendChild(stock);

    container.appendChild(card);
  });
}

function handleSearch() {
  const keyword = document.getElementById("keyword-input").value.trim();
  const category = document.getElementById("category-select").value;
  loadProducts(keyword, category);
}

document.getElementById("search-btn").addEventListener("click", handleSearch);

document.getElementById("keyword-input").addEventListener("keyup", (e) => {
  if (e.key === "Enter") handleSearch();
});

document
  .getElementById("category-select")
  .addEventListener("change", handleSearch);
loadProducts();
