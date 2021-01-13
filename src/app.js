App = {
  loading: false, // set app loading state
  contracts: {},

  load: async () => {
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContract();
    await App.render();
  },

  loadWeb3: async () => {
    // connect to running ganache instance (change port to 8545 for ganache-cli)
    // web3 == web3 connected to metamask
    // App.web3 == web3 connected to ganache
    // metamask is required to perfom transactions
    // blame metamask injected web3 for this confusion
    App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
    App.web3 = new Web3(App.web3Provider);

    // set owner
    App.owner = App.web3.eth.accounts[0];
  },

  loadAccount: async () => {
    // Set the current blockchain account
    // based on the currently selected account in metamask
    // dont confuse this with the contract owner
    App.account = web3.eth.accounts[0];
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const bankNegara = await $.getJSON("Bank.json");

    // contracts{} allows fetching multiple contracts
    App.contracts.bankNegara = TruffleContract(bankNegara);
    App.contracts.bankNegara.setProvider(web3.currentProvider);

    // get deployed contract instance
    App.bankNegara = await App.contracts.bankNegara.deployed();
  },

  // get bank balance or account balance depending on account
  getBalance: async () => {
    let value;
    if (App.account == App.owner) {
      value = await App.bankNegara.bankBalance({ from: App.account });
    } else {
      value = await App.bankNegara.getBalance({ from: App.account });
    }
    return value.toNumber();
  },

  setThreshold: async () => {
    let value = await App.bankNegara.setThreshold({ from: App.account });
    return value.toNumber();
  },

  deposit: async (amount) => {
    await App.bankNegara.deposit({ from: App.account, value: amount });
  },

  withdraw: async (amount) => {
    await App.bankNegara.withdraw(amount, { from: App.account });
  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return;
    }

    // Update app loading state
    App.loading = true;

    // Render Account

    // render different UI based on account address
    if (App.owner == App.account) {
      $("#admin").show();
    } else {
      // set up deposit button click hook
      $("#deposit").click(() => {
        amount = $("#amount").val();
        if (amount.length > 0) {
          amount = App.formatEther(amount);
          App.deposit(amount);
        } else window.alert("Please Enter a valid Amount!");
        // $("#balance").html(`$${App.formatMoney(await App.getBalance())}`);
      });

      // set up withdraw button click hook
      $("#withdraw").click(async () => {
        amount = $("#amount").val();

        // make sure user has balance
        if (amount.length > 0) {
          amount = App.formatEther(amount);
          bal = await App.getBalance();
          if (amount <= bal) {
            App.withdraw(amount);
          } else window.alert("Not Enough Balance in bank!");
        } else window.alert("Please Enter a valid Amount!");
      });
      $("#customer").show();
    }

    // set account shown on top left
    $("#account").html(App.account);

    // set balance
    $("#balance").html(`$${App.formatMoney(await App.getBalance())}`);
    // Update loading state
    App.loading = false;
  },

  // convert to usd then to ether and finally to wei
  formatEther: (amount) => App.web3.toWei(amount * 0.25 * 0.00094),

  // convert and format number to MYR
  formatMoney: (amount, decimalCount = 2, decimal = ".", thousands = ",") => {
    // convert to ether then to usd then to myr according to rates as of 13-01-2021
    amount = App.web3.fromWei(amount, "ether") * 1065 * 4.04;

    // needs to be in a try catch just incase amount is not a number
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

      const negativeSign = amount < 0 ? "-" : "";

      let i = parseInt(
        (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))
      ).toString();
      let j = i.length > 3 ? i.length % 3 : 0;

      return (
        negativeSign +
        (j ? i.substr(0, j) + thousands : "") +
        i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
        (decimalCount
          ? decimal +
            Math.abs(amount - i)
              .toFixed(decimalCount)
              .slice(2)
          : "")
      );
    } catch (e) {
      console.log(e);
    }
  },
};

$(() => {
  $(window).load(() => {
    App.load();
  });
});
