// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "../openzeppelin/token/ERC20/ERC20.sol";

// Token name             : A token for interoperability
// Token symbol           : EVM
// Total Supply           : 10M --> 10000000 * 10**18
// Decimals               : 18

// Provisioning address (testnet) : 0xd331C36e919f773f0D9B5cAbff5F80C0793a3DB8

contract EVMtoken is ERC20 {
    constructor() ERC20("A token for interoperability", "EVM") {
        _mint(0xd331C36e919f773f0D9B5cAbff5F80C0793a3DB8, 10000000 * 10**uint(decimals()));
    }
}