// const array = [1, 2, 3, 4, 5];
// let sum = 0;
// const sumArray = (array) => {
//   for (let i = 0; i < array.length; i++) {
//     sum += array[i];
//   }
//   return sum;
// };

// console.log(sumArray(array));

// import { add } from "./math.js";
// console.log(add(2, 3));

// 바리스타가 일을 시작
console.log("Script Start1"); // 1. 동기 코드
console.log("Script Start2"); // 1. 동기 코드
console.log("Script Start3"); // 1. 동기 코드

// 바리스타카 webAPI에게 0초 뒤에 로그 출력해줘라고 하고 돌아감.
setTimeout(() => {
  console.log("setTimeout"); // 4. 매크로태스크 == 베이글(일반줄 대기)
}, 1000);

// 바리스타가 VIP 주문을 받는다. Promise로 받는건 VIP 주문
Promise.resolve()
  .then(() => {
    console.log("Promise 1"); // 3. 마이크로태스크 == VIP 주문 1
  })
  .then(() => {
    console.log("Promise 2"); // 3. 마이크로태스크 == VIP 주문 2
  });

// 바리스타는 마저 작업을 처리한다.
console.log("Script End1"); // 2. 동기 코드
console.log("Script End2"); // 2. 동기 코드
console.log("Script End3"); // 2. 동기 코드
