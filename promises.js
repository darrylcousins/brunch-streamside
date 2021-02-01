// https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html

const doSomething = () => new Promise((resolve, reject) => {
  setTimeout(function(){
    resolve('Did something!');
  }, 2000);
});

const doSomethingElse = () => new Promise((resolve, reject) => {
  setTimeout(function(){
    resolve('Did something else!');
  }, 2000);
});

const finalHandler1 = (input) => console.log('#1', input);

doSomething().then(function () {
  return doSomethingElse();
}).then(finalHandler1);
// #1 Did something else!

const finalHandler2 = (input) => console.log('#2', input);

doSomething().then(function () {
  doSomethingElse();
}).then(finalHandler2);
// #2 undefined

const finalHandler3 = (input) => console.log('#3', input);

doSomething().then(doSomethingElse()).then(finalHandler3);
// #3 Did something!

const finalHandler4 = (input) => console.log('#4', input);

doSomething().then(doSomethingElse).then(finalHandler4);
// #4 Did something else!





