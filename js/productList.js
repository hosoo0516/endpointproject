const BASE_URL = "http://teacherdev09.kro.kr:10002/endpoint";

async function loadProducts() {
  const response = await fetch(
    `${BASE_URL}/api/products?page=0&size=10&sort=id,desc`,
  );
  const result = await response.json();
  const productList = result.data.content;

  const container = document.getElementById("product-container");
  container.innerHTML = ""; 

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

loadProducts();
