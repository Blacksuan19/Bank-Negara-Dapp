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
    await App.bankNegara.setThreshold({ from: App.account });
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
      $("#admin").show();
    } else {
      // set up deposit button click hook
      $("#deposit").click(() => {
        amount = $("#amount").val();
        // make sure the amount field is not empty
        if (amount.length > 0) {
          amount = App.formatEther(amount);
          App.deposit(amount);
        } else window.alert("Please Enter a valid Amount!");
      });

      // set up withdraw button click hook
      $("#withdraw").click(async () => {
        amount = $("#amount").val();

        // make sure the amount field is not empty
        if (amount.length > 0) {
          amount = App.formatEther(amount);
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

    // set balance
    App.setBalance();

    // Update loading state
    App.loading = false;
  },
  setBalance: async () => {
    $("#balance").html(`${App.formatMoney(await App.getBalance())}`);
  },
  // convert to usd then to ether and finally to wei
  formatEther: (amount) => App.web3.toWei(amount / 1065 / 4.04),

  // convert and format number to MYR
  formatMoney: (amount) => {
    // convert to ether then to usd then to myr according to rates as of 13-01-2021
    amount = App.web3.fromWei(amount, "ether") * 1065 * 4.04;

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
