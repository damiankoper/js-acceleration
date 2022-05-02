console.log(1);
Promise.resolve().then(() => setTimeout(() => console.log(6)));
setTimeout(() => console.log(4), 0);
setTimeout(() => Promise.resolve().then(() => console.log(5)));
Promise.resolve().then(() => console.log(3));
console.log(2);
