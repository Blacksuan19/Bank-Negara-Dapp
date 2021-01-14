App = {
  loading: false, // set app loading state
  contracts: {},

  load: async () => {
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContract();
    await App.setRate();
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

  setThreshold: async (value) => {
    await App.bankNegara
      .setThreshold(value, { from: App.account })
      .then(async () => {
        $("#threshold").html(
          `${App.formatMoney(await App.getThreshold())} /
         ${App.web3.fromWei(thres)} ETH`
        );
      });
  },
  getThreshold: async () => {
    thres = await App.bankNegara.threshold({ from: App.account });
    return thres.toNumber();
  },

  // deposit then update the balance text
  deposit: async (amount) => {
    await App.bankNegara
      .deposit({ from: App.account, value: amount })
      .then(() => {
        App.setBalance();
        // reset amount input
        $("#amount").val("");
      });
  },

  // withdraw then update the balance text
  withdraw: async (amount) => {
    await App.bankNegara.withdraw(amount, { from: App.account }).then(() => {
      App.setBalance();
      // reset amount input
      $("#amount").val("");
    });
  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return;
    }

    // Update app loading state
    App.loading = true;

    // render different UI based on account type
    if (App.owner == App.account) {
      // set balance type label
      $("#type-label").html("Bank Balance");

      // set threshold amount
      thres = await App.getThreshold();
      $("#threshold").html(`${App.web3.fromWei(thres)} ETH`);

      $("#update-threshold").click(() => {
        new_val = $("#thres-val").val();
        if (new_val.length > 0) {
          new_val = App.web3.toWei(new_val);
          console.log(new_val);
          App.setThreshold(new_val);
        } else window.alert("Please Enter a valid Amount!");
      });

      $("#thres-div").show();
      $("#admin").show();
    } else {
      $("#type-label").html("Balance");
      // set up deposit button click hook
      $("#deposit").click(() => {
        amount = $("#amount").val();
        // make sure the amount field is not empty
        if (amount.length > 0) {
          amount = App.web3.toWei(amount);
          App.deposit(amount);
        } else window.alert("Please Enter a valid Amount!");
      });

      // set up withdraw button click hook
      $("#withdraw").click(async () => {
        amount = $("#amount").val();

        // make sure the amount field is not empty
        if (amount.length > 0) {
          amount = App.web3.toWei(amount);
          // make sure user has enough balance
          bal = await App.getBalance();
          if (amount <= bal) {
            App.withdraw(amount);
          } else {
            window.alert("Not Enough Balance in Bank!");
            $("#amount").val("");
          }
        } else window.alert("Please Enter a valid Amount!");
      });

      // finally show the customer UI
      $("#customer").show();
    }

    // set account shown on top left
    $("#account").html(App.account);

    // set exchange rate
    $("#rate").html(`1 ETH = RM ${App.rate}`);

    // set balance
    App.setBalance();

    // Update loading state
    App.loading = false;
  },
  setBalance: async () => {
    bal_wei = await App.getBalance();
    $("#balance").html(`${App.formatMoney(bal_wei)}`);
    $("#bal-ether").html(`${App.web3.fromWei(bal_wei, "ether")} ETH`);
    $("#bal-ether").show();
  },

  // fetch and set exchange rate using coinbase API (used to convert balance to MYR)
  setRate: async () => {
    App.rate = 0;
    await fetch("https://api.coinbase.com/v2/exchange-rates?currency=ETH")
      .then((response) => {
        return response.json();
      })
      .then((str_json) => {
        App.rate = str_json.data.rates.MYR;
      });
  },

  // convert and format number to MYR
  formatMoney: (amount) => {
    amount = App.web3.fromWei(amount, "ether") * App.rate;

    var formatter = new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
    });

    return formatter.format(amount);
  },
};

// start loading the app as soon as the window is loaded
$(() => {
  $(window).load(() => {
    App.load();
  });
});
