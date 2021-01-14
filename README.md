# Bank-Negara-Dapp

a decentralized App representing a bank

## Features

### General

- contract address used as bank.
- tests for all contract functions.
- strict checks using modifiers.
- strict checks in web interface.
- different interface for admin and regular customers.
- up to exchange rate via coinbase API.

### Admin

- Set Transaction Threshold.
- recive alert when transaction is above threshold.
- recive alert when the bank has a balance of more than 50 ethers (a case of money laundering).

### Users

- Deposit.
- Withdraw.

## Requirements

- [Metamask](https://metamask.io/)
- [nodejs](https://nodejs.org/en/download/)
- [Truffle](https://www.trufflesuite.com/)
- [ganache](https://www.trufflesuite.com/ganache)
- install required packages with `npm install`

## Development

- Compile code via `truffle compile`
- deploy to ganache using `truffle migrate --reset`
- `truffle console` to interact with the deployed contract

## Contract Tests

- tests are located in the test folder
- to run tests run `truffle test`

## Deployment

- run `truffle migrate --network ropstan` to deploy to ropstan test network

## Web Interface development

- start the server using `npm run dev`

## Web Interface Preview

### Customer

![customers](./screens/customers.png)
