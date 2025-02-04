# Bank-Negara-Dapp

A Decentralized App Representing a Bank

## Features

### General

- Contract address used as bank.
- Tests for all contract functions.
- Strict checks using modifiers.
- Strict checks in web interface.
- Different interface for admin and regular customers.
- Up to date exchange rate via coinbase API.

### Admin

- Set Transaction Threshold.
- Receive alert when transaction is above threshold.
- Receive alert when the bank has a balance of more than 50 ethers (a case of money laundering).

### Users

- Deposit.
- Withdraw.

## Requirements

- [Metamask](https://metamask.io/)
- [nodejs](https://nodejs.org/en/download/)
- [Truffle](https://www.trufflesuite.com/)
- [ganache](https://www.trufflesuite.com/ganache)
- Install required packages with `npm install`

## Development

- Compile code via `truffle compile`
- Deploy to ganache using `truffle migrate --reset`
- `truffle console` to interact with the deployed contract

## Contract Tests

- Tests are located in the test folder
- To run tests run `truffle test`

![tests](./screens/tests.png)

## Deployment

The contrct is already deployed to the ropstan test network using [infura](http://infura.io/), to redeploy you need to use the first account from the accounts generated by the seed phrase in truffle-config.json.<br><br>
more information on how to deploy and intract with contracts on infura in this [guide](https://blog.infura.io/deploying-smart-contracts-managing-transactions-ethereum/).<br>

- Deployed contract address: [ropstan](https://ropsten.etherscan.io/address/0x8f129e60fd0a99128b234ab2ad434178df78442d).
- Run `truffle migrate --network ropstan` to deploy to ropstan test network

## Web Interface development

There are 2 user interfaces, one for the customer and another for the admin/regulator,
which one is loaded depends on the account selected in metamask,
if its the first account in ganache then its the admin,
o add accounts from ganache to metamask follow [this guide](https://www.trufflesuite.com/docs/truffle/getting-started/truffle-with-metamask).

- Start the server using `npm run dev`

## Some Notes

- Referesh the page after changing account in metamask.
- `tailwind.config.js` enables tailwind IntelliSense in vscode with the [tailwind extension](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss).

## Web Interface Preview

### Customer

![customer](./screens/customer.png)
<br><br>
![customer2](./screens/deposit.png)

### Admin

![admin](./screens/admin.png)

## Credits

- [Dapp-university](https://www.dappuniversity.com/) for the helpful tutorials and Javascript boilerplate.
- Google and StackOverflow for always answering my questions.
