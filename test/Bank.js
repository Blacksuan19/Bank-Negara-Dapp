const Bank = artifacts.require("Bank");

// one extra test for good measures
contract("Bank", (accounts) => {
  let bank; // the bank
  // shorten commonly used functions
  let toWei = web3.utils.toWei;
  let fromWei = web3.utils.fromWei;
  before(async () => {
    bank = await Bank.deployed(); // get bank instance
  });

  it("should set threashold successfully", async () => {
    // accounts[0] is the owner
    await bank.setThreshold(20, { from: accounts[0] });
    thres = await bank.threashold();
    assert.equal(thres.toNumber(), 20);
  });

  it("should deposit 3 ether to the bank", async () => {
    let value = toWei("3", "ether");
    await bank.deposit({ from: accounts[1], value: value });
    // accounts[0] is the owner
    let bal_wei = await bank.bankBalance({ from: accounts[0] });
    let bal_ether = fromWei(bal_wei, "ether");
    assert.equal(bal_ether, 3);
  });

  it("should withdraw 3 ether from the bank", async () => {
    let value = toWei("3", "ether");

    // withdraw amount deposited in last test (bank should have 0 now)
    await bank.withdraw(value, { from: accounts[1] });

    // get the balance after transactions
    let bal_wei = await bank.bankBalance({ from: accounts[0] });
    let bal_ether = fromWei(bal_wei, "ether");
    assert.equal(bal_ether, 0);
  });

  // another way to test events would be to pass --show-events arg to truffle test
  it("should emit AboveLimitTransaction and HighBalance events", async () => {
    let value = toWei("60", "ether"); // over the limit
    let receipt = await bank.deposit({ from: accounts[2], value: value });

    // check AboveLimitTransaction event name and culprit
    even_name = receipt.logs[0].event;
    assert.equal(even_name, "AboveLimitTransaction");
    assert.equal(receipt.logs[0].args.accountAddress, accounts[2]);

    // the suspects are all the accounts used in this test file except the owner 0
    suspects = receipt.logs[1].args.suspectedAccounts;
    assert.equal(suspects[0], accounts[1]);
    assert.equal(suspects[1], accounts[2]);
  });
});
