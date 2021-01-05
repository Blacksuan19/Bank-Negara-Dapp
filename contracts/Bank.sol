// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.7.0;


contract Bank {
    uint256 public threashold;
    uint256 max;
    mapping(address => uint256) private balances; // keep track of individual balances
    address[] accounts; // store accounts hashes for when there is a chance of money laundering
    address owner;

    // emitted when a trasnaction value > threashold
    event AboveLimitTransaction(
        string message,
        address indexed accountAddress,
        uint256 amount
    );

    // emitted when the contract balance is > max
    event HighBalance(string message, address[] suspectedAccounts);

    // emitted when an account is low on funds
    event LowFunds(address indexed accountAddress, string message);

    // restrict some fuctions to only onwer account
    modifier OnlyOwner {
        require(
            owner == msg.sender,
            "You are not allowed to perform this action"
        );
        _; // i dont know what is this but compilation fails without it
    }

    // prevent the bank regulator from robbing others
    modifier NonOwner {
        require(owner != msg.sender, "Regulator can not perform this action");
        _;
    }

    constructor() public {
        // set owner, transaction threashold, and max allowed money in bank
        owner = msg.sender;
        max = 50 ether;
        threashold = 10 ether;
    }

    // set threashold for any transaction
    function setThreshold(uint256 _thres) public payable OnlyOwner {
        threashold = _thres;
    }

    function deposit() public payable NonOwner {
        // add account to accounts index after making sure its not already there
        if (!isInAccounts()) accounts.push(msg.sender);

        // add the amount to the accounts balance
        // no neeed to manually transfer msg.value to the contract about (bank)
        // because its automatically done
        balances[msg.sender] += msg.value;

        // send an alert if its above the threashold
        if (msg.value > threashold) {
            emit AboveLimitTransaction(
                "transaction amount above threashold! ",
                msg.sender,
                msg.value
            );
        }

        // send an alert if the bank has more then 50 ethers
        if (address(this).balance > max) {
            emitHigh();
        }
    }

    function withdraw(uint256 amount) public payable NonOwner {
        // Check enough balance available
        if (amount <= balances[msg.sender]) {
            // check if above tranaction limit
            if (amount > threashold) {
                emit AboveLimitTransaction(
                    "transaction amount above threashold! ",
                    msg.sender,
                    amount
                );
            }

            // deduct the account balance
            balances[msg.sender] -= amount;

            // transfer the money to that account
            msg.sender.transfer(amount);

            // send an alert if the bank has more than 50 ethers
            if (address(this).balance > max) {
                emitHigh();
            }
        } else emit LowFunds(msg.sender, "Account does not have enough funds");
    }


    /// @return balance of an account in the bank
    function getBalance() public view NonOwner returns (uint256) {
        return balances[msg.sender];
    }
    /// @return balance of the Simple Bank contract (represents the bank balance)
    function bankBalance() public view OnlyOwner returns (uint256) {
        return address(this).balance;
    }

    // @returns true if msg.sender is already in known accounts
    function isInAccounts() private view returns (bool) {
        for (uint256 i = 0; i < accounts.length; i++) {
            if (accounts[i] == msg.sender) return true;
        }
        return false;
    }

    // internal function to emit high event (need to write it twice so better make a function)
    function emitHigh() internal {
        emit HighBalance(
            "The bank has 50+ ether, the bank might have been used for money laundering. list of suspected accounts",
            accounts
        );
    }
}
