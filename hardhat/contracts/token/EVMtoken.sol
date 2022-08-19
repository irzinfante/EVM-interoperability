// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "../openzeppelin/token/ERC20/ERC20.sol";
import "../openzeppelin/access/Ownable.sol";

contract EVMtoken is ERC20, Ownable {
    constructor(uint preMint) ERC20("A token for interoperability", "EVM") Ownable() {
        _mint(msg.sender, preMint * 10**uint(decimals()));
    }

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }
}
