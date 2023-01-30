<h1 align="center">Welcome to my solution for finding lost kittens 🐱</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> See https://which-technical-exercise.herokuapp.com/

## Install

```sh
yarn install
```

## Usage

```sh
yarn start
```

## Run tests

```sh
yarn run test
```

## Interesting decisions I made

- Returning errors instead of throwing  
  Similar to Go I have opted to return all my errors from my domain services to help manage different error classes  
  See: https://dev.to/qpwo/goodbye-trycatch-hello-error-return-5hcp
- I have used Zod for defining my schema for the expected response from the forensics API.  
  Since, I am treating this service as a 3rd party, and it can return multiple types of responses, I required validation.  
  Using Zod I can define a single schema and infer the typescript type directly  
  See: https://zod.dev/
- I have used dependency injection and a ports and adapters architecture to help make my code easier to test

## What would I do if I had more time?

- I found that the forensics APIs has a substantial warmup time that can cause my external tests to fail  
  Adding some retry logic with an exponential cool down would help to alleviate this

## Author

👤 **Craig Forrest**

- Website: https://craigforrest.co.uk
- Github: [@CForrest97](https://github.com/CForrest97)

## Show your support

Give a ⭐️ if this project helped you!

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
