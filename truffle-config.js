const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic =
  "message ostrich vanish ten surround palm window huge mule dance claim matrix";
// deployed contract https://ropsten.etherscan.io/address/0x8f129e60fd0a99128b234ab2ad434178df78442d

module.export = {
  networks: {
    development: {
      host: "localhost",
      port: 7545, // ganache cli
      network_id: 5777,
      gas: 5000000,
    },
    ropsten: {
      provider: function () {
        const URI =
          "https://ropsten.infura.io/v3/e872c65194d141d7a9ee7566aa6b9387";
        return new HDWalletProvider(mnemonic, URI);
      },
      network_id: 3,
    },
  },
  compilers: {
    solc: {
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
