// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "../openzeppelin/token/ERC20/ERC20.sol";

// Token name             : A token for interoperability
// Token symbol           : EVM
// Total Supply           : 10M --> 10000000 * 10**18
// Decimals               : 18

contract EVMtoken is ERC20 {
    constructor() ERC20("A token for interoperability", "EVM") {
        _mint(msg.sender, 10000000 * 10**uint(decimals()));
    }
}