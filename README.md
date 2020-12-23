# DMM Safe App

Running instance on AWS Amplify https://main.d3t95nyl903vsf.amplifyapp.com/

## Getting Started

Install dependencies and set up `.env` variables as in `.env.sample`.

```
yarn install

cp .env.sample .env
.
.
.
yarn start
```

Then:

- If HTTPS is used (by default enabled)
  - Open your Safe app locally (by default via https://localhost:3000/) and accept the SSL error.
- Go to Safe Multisig web interface
  - [Mainnet](https://gnosis-safe.io/app
  - [Rinkeby](https://rinkeby.gnosis-safe.io/app)
- Create your test safe
- Go to Apps -> Manage Apps -> Add Custom App
- Paste your localhost URL, default is https://localhost:3000/
- You should see Safe App Starter as a new app
