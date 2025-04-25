'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2024-11-01T13:15:33.035Z',
    '2024-11-30T09:48:16.867Z',
    '2024-12-25T06:04:23.907Z',
    '2025-01-25T14:18:46.235Z',
    '2025-02-05T16:33:06.386Z',
    '2025-04-11T14:43:26.374Z',
    '2025-04-14T18:49:59.371Z',
    '2025-04-17T12:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

//creates a new element on the index, inside the 'movements' container div. Takes the movements, runs through each and display each
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  //this creates a new data structure (an array of objects) and is the same thing as => {return mov; return acc.movementsDates.at(i)}
  const combinedMovsDates = acc.movements.map((mov, i) => ({
    movement: mov,
    movementDate: acc.movementsDates.at(i),
  }));

  if (sort) combinedMovsDates.sort((a, b) => a.movement - b.movement);

  combinedMovsDates.forEach(function (obj, i) {
    //destructuring obj to put it's values on those two variables
    const { movement, movementDate } = obj;
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(movementDate);
    // const displayDate = formatMovementDate(date, acc.locale);
    // const formattedMov = formatCur(movement, acc.locale, acc.currency);

    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(movement, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

//pega siglas do nome. Deixa tudo em minúsculo, divide em strings tudo entre os espaços, retorna a primeira letra, e depois junta tudo na mesma string. Feito um "side effect"(fazer algo e não retornar valor): todas as atuais accounts terão uma nova propriedade que são as siglas
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLocaleLowerCase()
      .split(' ')
      .map(function (name) {
        return name[0];
      })
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  //Display movements
  displayMovements(acc);

  //Display balance
  calcDisplayBalance(acc);

  //Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // IN EACH CALL, PRINT THE REMAINING TIME TO UI
    labelTimer.textContent = `${min}:${sec}`;

    // WHEN 0 SECONDS, STOP TIMET AND LOG OUT
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get Started';
      containerApp.style.opacity = 0;
    }

    // DECREASE 1s
    time--;
  };

  // SET TIME TO 5 MINUTES
  let time = 30;

  // CALL THE TIMER EVERY SECOND
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

/////////////////////////////////////////////
// Event Handler
let currentAccount, timer;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 1;

btnLogin.addEventListener('click', function (e) {
  //prevents form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  //the interrogation is basically a "if exists" Without it, it would be currentAccount && currentAccount.pin [the rest]
  if (currentAccount?.pin === +inputLoginPin.value) {
    //Display UI and welcome message
    //takes the full name, splits it into two divided right at where the space is, and use only the first division. And changes the HTML
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 1;

    //Create current date
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };
    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) clearInterval(timer);

    timer = startLogOutTimer();
    //UPDATE UI (use anywhere)
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    //doing the transfering
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    //UPDATE UI (use anywhere)
    updateUI(currentAccount);

    //RESET THE TIMER
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  //checks if the loan you are asking is greater than zero and if the current highest deposit is greater than 10% of the loan
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      //add movement
      currentAccount.movements.push(amount);

      //add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      //update UI
      updateUI(currentAccount);

      //RESET THE TIMER
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    //loops through array and finds the first index that corresponds to the condition
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    //Deletes account
    accounts.splice(index, 1);

    //Hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  //!sorted makes it flip. If it was true, now it's false, and vice-versa
  displayMovements(currentAccount, !sorted);
  //this is what lets sorted be flipped. When the click happens, the opposite of false is called. If this didn't exist, it would always be true after the click, because the let never changes. But now, it changes the let, ready to be clicked again
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*

//CONVERSTING AND CHECKING NUMBERS
//JS se baseia em Base 10 e binário
//Base 10 onde todos os números vao de 0 a 9 apenas. Então 1/10 = 0.1 e 3/10 = 3.3333333
console.log(23 === 23.0);
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

// Conversion
console.log(Number('23'));
console.log(+'23');

// Parsing
//bom colocar o número 10 para dizer "base 10" e evitar bugs. Se colocar "2", a função fica binária (não sei o que significa)
console.log(Number.parseInt('30px', 10));
console.log(Number.parseInt('p30', 10));

console.log(Number.parseInt('2.5rem'));
console.log(Number.parseFloat('2.5rem'));

//you can do it like that, but it's not incentivized
//console.log(parseFloat('2.5rem'));

console.log(Number.isNaN(20));
console.log(Number.isNaN(+'20X'));
console.log(Number.isNaN(23 / 0));

//is Finite is the BEST WAY TO CHECK IF THE VALUE IS A NUMBER
console.log(Number.isFinite(20));
console.log(Number.isFinite('20'));
console.log(Number.isFinite(+'20X'));
console.log(Number.isFinite(23 / 0));
*/

/*

console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

console.log(Math.max(5, 18, 23, 11, 2));
console.log(Math.max(5, 18, '23', 11, 2));
console.log(Math.max(5, 18, '23px', 11, 2));

console.log(Math.min(5, 18, 23, 11, 2));

//calculates the circuference of 10 pixels taken from the user interface
console.log(Math.PI * Number.parseFloat('10px') ** 2);

//trunc removes decimals. Random goes from 0 to 0.999999. So the +1 is to make sure it has the chance to reach 6
console.log(Math.trunc(Math.random() * 6) + 1);

//multiplying makes it possible to go from the limits min and max sets. The +1 is to make sure it reaches the maximum properly, and the +min is because or else the range would be too low
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

console.log(randomInt(10, 20));
console.log(randomInt(0, 3));

// Rounding Integers
console.log(Math.round(23.3));
console.log(Math.round(23.9));

console.log(Math.ceil(23.3));
console.log(Math.ceil(23.9));

console.log(Math.floor(23.3));
console.log(Math.floor('23.9'));

console.log(Math.trunc(23.3));

//floor also works with negatives, so it's always better to use
console.log(Math.trunc(-23.3));
console.log(Math.floor(-23.3));

// Rounding Decimals
//always returns strings
console.log((2.7).toFixed(0));
console.log((2.7).toFixed(3));
console.log((2.345).toFixed(2));
console.log(+(2.345).toFixed(2));

*/

/*

// REMAINDER
//used to check the reaminder after a division, useful to see if a number is even/completely divisible

console.log(5 % 2); // 5 = 2 * 2 + 1(remainder)
console.log(5 / 2);

console.log(8 % 3); // 8 = 3 * 2 + 2(remainder)
console.log(8 / 3);

console.log(6 % 2); // 6 = 2 * 3 + 0(remainder)
console.log(6 / 2);

console.log(7 % 2); // 7 = 2 * 3 + 1(remainder)
console.log(7 / 2);

const isEven = n => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(514));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered'; //0, 2, 4, 6... mudarão de cor
    if (i % 3 === 0) row.style.backgroundColor = 'blue'; //0, 3, 6, 9 mudarão de cor
  });
});

*/

/*

//NUMERIC SEPARATOR

// 287,460,000,000
const diameter = 287_460_000_000;
console.log(diameter);

const price = 345_99;
console.log(price);

const transferFee1 = 15_00;
const transferFee2 = 1_500;

//não pode colocar underscore depois de um "." ou no começo/final do número
const PI = 3.14_15;
console.log(PI);

//apenas use o underscore no código para números. Se colocar em uma string, ele não reconhece mais como número
console.log(Number('230_000'));
//ele pega apenas os números de antes do underscor
console.log(parseInt('230_000'));

*/

/*

// BIG INT
//this is the biggest number JS can produce with int
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
//it should had summed with 53, but it doesn't. It starts to be inconsistent past this
//it becomes "unsafe"
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);

//to go past this, you put an n and make it a big int
console.log(3267412896423876421746237121467n);
console.log(BigInt(32674128964237));

//Operations
console.log(10000n + 10000n);
console.log(3267412896423876421746237121467n + 1000001n);

//bigInts don't operate with ints, you need to concate
const huge = 1242142342352332n;
const num = 23;
console.log(huge * BigInt(num));

//Exceptions
console.log(20n > 15);
console.log(20n === 20);
console.log(typeof 20n);
console.log(20n == 20);
console.log(20n == '20');
//we cannot take the square root of bigInt
//console.log(Math.sqrt(16n));

console.log(huge + ' is REALLY big!!!');

//Divisions
//returns the closest big int, not decimals
console.log(10n / 3n);
console.log(10 / 3);

*/

/*

// CREATE A DATE
const now = new Date();
console.log(now);

console.log(new Date('Aug 02 2020 18:05:41'));
console.log(new Date('December 24, 2015'));
console.log(new Date(account1.movementsDates[0]));

console.log(new Date(2037, 10, 19, 15, 23, 5));
console.log(new Date(2037, 10, 31));

console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));

*/
/*

// WORKING WITH DATES
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
//day of the month
console.log(future.getDate());
//day of the week
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime());

console.log(new Date(2142267780000));

console.log(Date.now());

future.setFullYear(2040);
console.log(future);
*/

/*

//OPERATIONS WITH DATES
const future = new Date(2037, 10, 19, 15, 23);
// console.log(Number(future));
console.log(+future); //mesma coisa que o de cima

//this last parentheses' formula converts the miliseconds we'll get from the first parentheses and convert into days. Mili times seconds times mins * hours
const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const days1 = calcDaysPassed(new Date(2037, 3, 4), new Date(2037, 3, 14));
console.log(days1);
*/

/*
const num = 3884764.23;

const options = {
  style: 'currency',
  unit: 'celsius',
  currency: 'EUR',
  // useGrouping: false,
};

console.log('US:', new Intl.NumberFormat('en-US', options).format(num));
console.log('Germany:', new Intl.NumberFormat('de-DE', options).format(num));
console.log('Syria:', new Intl.NumberFormat('ar-SY', options).format(num));
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language, options).format(num)
);
*/

//setTimeout

/*

const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  3000,
  ...ingredients
);
console.log('waiting...');

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

//setInterval
setInterval(function () {
  const now = new Date();
  console.log(now);
}, 3000);
*/
