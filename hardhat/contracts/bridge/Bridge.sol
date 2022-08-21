// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "../token/EVMtoken.sol";
import "../openzeppelin/access/Ownable.sol";

contract Bridge is Ownable {

    EVMtoken private token;

    constructor(address tokenAddress) Ownable() {
        token = EVMtoken(tokenAddress);
    }

    function depositTokens(uint256 amount, uint chainId) public {
        token.transferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, amount, chainId);
    }

    function withdrawTokens(address to, uint256 amount) public onlyOwner {
        token.transfer(to, amount);
        emit Withdraw(to, amount);
    }

    function burnTokens(uint256 amount, uint chainId) public {
        token.burn(msg.sender, amount);
        emit Burn(msg.sender, amount, chainId);
    }

    function mintTokens(address to, uint256 amount) public onlyOwner {
        token.mint(to, amount);
        emit Mint(to, amount);
    }

    event Deposit(address indexed from, uint256 amount, uint chainId);

    event Withdraw(address indexed to, uint256 amount);

    event Burn(address indexed from, uint256 amount, uint chainId);

    event Mint(address indexed to, uint256 amount);
}
