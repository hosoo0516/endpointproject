const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ3bmZwdm0xM0B0ZXN0LmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzg2NzAwNjI5LCJleHAiOjE3ODY3MDQyMjl9.GjFwrthO6X1e47MPo_Q4XON8k8lUAGqvWLeeMbBJzk2Vqxogaaj5PjEvZhYp3D516MFFNLGTeBQsDU7f0ourvw"; //임시 토큰
    async function CreateOrder(e){
        e.preventDefault(); // form의 기본동작인 새로고침 막기
        let $article = document.getElementById("article").value;
        let $quantity = document.getElementById("quantity").value;
        $article = Number($article);
        $quantity = Number($quantity);
    const response = await fetch("http://teacherdev09.kro.kr:10002/endpoint/api/orders",{ // fetch() API 호출 함수. 주소값 출력 , response(결과물, 영수증) , await는 불러오고 난 후 다음 코드로 이동.
        method : 'POST', //새로운 데이터 만들기
        headers : { //보내는 데이터의 형태 저장
            'Content-Type' : 'application/json', //물품종류칸 , 서버에서 주고받는 데이터는 JSON(문자열로된 객체)형식이라는 것
            'Authorization' : `Bearer ${token}` //신분증/보안출입증칸 , Bearer(토큰인증방식), 토큰확인
         },
        body : JSON.stringify({ //입력받은 값을 JSON형식으로 변경
            items: [
                {
                    "productId" : $article,
                    "quantity" : $quantity
                }
            ]
        })
    });
    const data = await response.json(); //response을 json으로 변환(문자열로된 객체)

    alert(data.message);
    console.log("data전체",data);
    console.log("주문한 상품:", data.data.items[0].productName);
    console.log("주문한 상품 ID:", data.data.items[0].productId);
    console.log("주문한 수량:", data.data.items[0].quantity);
    console.log("총 가격:", data.data.items[0].orderPrice * data.data.items[0].quantity );
};