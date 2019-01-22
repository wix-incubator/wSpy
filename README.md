# wSpy:  
1. [Introduction](#introduction)  
2. [Getting Started:](#getting-started)

## Introduction
Smart log of sync and async operation queues with stack-traces for debugging.

## Getting Started:
1. Add wSpy to your project:  
    ```
    $ npm i --save wspy
    ```
    or:
    ```
    $ yarn add wspy
    ```
2. Require `wSpy` in your file:  
    ```
    const wSpy = require('wspy')
    ```
3. Add logs to main points in your code:
    ```
    wSpy.log(logName, [functionName, arguments])
    ```
