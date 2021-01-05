module.export = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: 5777,
      gas: 5000000,
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
