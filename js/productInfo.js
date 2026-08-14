const BASE_URL = "http://teacherdev09.kro.kr:10002/endpoint";

const urlParams = new URLSearchParams(location.search);
const productId = urlParams.get("id");

async function loadProductDetail() {
  const response = await fetch(`${BASE_URL}/api/products/${productId}`);
  const result = await response.json();
  const product = result.data;

  const container = document.getElementById("detail-container");
  container.innerHTML = "";

  const card = document.createElement("div");
  card.className = "detail-card";

  const badge = document.createElement("p");
  badge.className = "badge";
  badge.textContent = product.category;

  const title = document.createElement("h2");
  title.textContent = product.name;

  const price = document.createElement("p");
  price.className = "price";
  price.style.fontSize = "20px";
  price.textContent = `${product.price.toLocaleString()}원`;

  const stock = document.createElement("p");
  stock.style.marginTop = "8px";
  stock.textContent = `남은 재고: ${product.stockQuantity}개`;

  const desc = document.createElement("p");
  desc.style.marginTop = "12px";
  desc.style.color = "#555";
  desc.textContent = `설명: ${product.description}`;

  const date = document.createElement("p");
  date.style.marginTop = "8px";
  date.style.fontSize = "12px";
  date.style.color = "#888";
  date.textContent = `등록일: ${new Date(product.createdAt).toLocaleDateString()}`;

  card.appendChild(badge);
  card.appendChild(title);
  card.appendChild(price);
  card.appendChild(stock);
  card.appendChild(desc);
  card.appendChild(date);

  container.appendChild(card);
}
loadProductDetail();
