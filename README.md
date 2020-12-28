# DMM Safe App

Running instance on AWS Amplify https://main.d3t95nyl903vsf.amplifyapp.com/

## Getting Started

1. Go to Safe Multisig web interface
   - [Mainnet](https://gnosis-safe.io/app)
   - [Rinkeby](https://rinkeby.gnosis-safe.io/app)
2. Create a safe or use an existing one
3. Go to Apps -> Manage Apps -> Add Custom App
4. Add the app URL:
   - https://main.d3t95nyl903vsf.amplifyapp.com/
   - Or your localhost URL (default is https://localhost:3000/) if you're running the app locally\*.
5. Agree with Gnosis policy, press on the `Add`
6. You should see Safe App Starter as a new app

---

\*To run the app locally:

- Install dependencies and set up `.env` variables as in `.env.sample`.

```
yarn install

cp .env.sample .env
.
.
.
yarn start
```

- Then if HTTPS is used (by default enabled), open your Safe app locally (by default via https://localhost:3000/) and accept the SSL error.
