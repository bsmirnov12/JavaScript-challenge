# JavaScript-challenge

### UT-TOR-DATA-PT-01-2020-U-C  Week 14 Homework

##### (c) Boris Smirnov

---


* [UFO Level 1](https://bsmirnov12.github.io/JavaScript-challenge/UFO-level-1/) 
* [UFO Level 2](https://bsmirnov12.github.io/JavaScript-challenge/UFO-level-2/)
 
## P.S. Class Field Declarations

As it appeared, I used experimental feature of JavaScript, that was supported only by the most recent versions of browsers.

The feature is called *Class Field Declaration* or *Static Class Property* and it isn't part of ES6 (ECMAScript 2015),
however there is a proposal and it is on [Stage 5 (Candidate)](https://github.com/tc39/proposal-class-fields)

Here are browser compatibility tables (Desktop and Mobile):

| Chrome | Edge | Firefox | IE | Opera | Safary |
| ------ | ---- | ------- | -- | ----- | ------ |
|   74   |  79  |    69   | No |   60  |   No   |

| Webview/Chrome | Firefox | Opera | Safari | Samsung |
| -------------- | ------- | ----- | ------ | ------- |
|      72        |   No    |   51  |   No   |    No   |


In my case it was a filter registry array, that was incapsulated as a static class member because it was relevant
only to the class functionality, so I thought it belonged there.

Making this registry array a global variable solved the problem (even MS Edge v44 can open it).

