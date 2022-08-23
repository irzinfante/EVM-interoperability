import { Injectable } from '@angular/core';
import Web3 from "web3";
import Web3Modal from "web3modal";
import { Subject } from 'rxjs';
import { BSC_TESTNET_NODE, GOERLI_TESTNET_NODE, BESU_LOCAL_NODE } from '../environments/NODES.env';
import { EVMToken_abi } from '../abis/EVMToken.abi.js';
import { Bridge_abi } from '../abis/Bridge.abi.js';

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
    private web3js: any;
    web3BSC: any;
    web3Goerli: any;
    web3Besu: any;
    web3Modal;

    private accountStatusSource = new Subject<any>();
    accountStatus$ = this.accountStatusSource.asObservable();

    constructor() {
        const providerOptions = {};

        this.web3Modal = new Web3Modal({
            cacheProvider: false,
            providerOptions,
            theme: {
                background: "rgb(39, 49, 56)",
                main: "rgb(199, 199, 199)",
                secondary: "rgb(136, 136, 136)",
                border: "rgba(195, 195, 195, 0.14)",
                hover: "rgb(16, 26, 32)"
            }
        });

        this.web3BSC = new Web3(BSC_TESTNET_NODE);
        this.web3Goerli = new Web3(GOERLI_TESTNET_NODE);
        this.web3Besu = new Web3(BESU_LOCAL_NODE);
    }

    async connectAccount() {
        this.web3Modal.clearCachedProvider();
        let provider = await this.web3Modal.connect();
        this.web3js = new Web3(provider);
        return this.web3js;
    }

    async balanceOf(account, tokenAddress, web3Instance) {
        let tokenContract = new web3Instance.eth.Contract(EVMToken_abi, tokenAddress);
        let result = await tokenContract.methods.balanceOf(account).call();
        return this.web3js.utils.fromWei(result, "ether");
    }

    async allowance(tokenAddress, account, bridgeAdress) {
        let tokenContract = new this.web3js.eth.Contract(EVMToken_abi, tokenAddress);
        let result = await tokenContract.methods.allowance(account, bridgeAdress).call();
        return this.web3js.utils.fromWei(result, "ether");
    }

    approve(tokenAddress, spender, amount) {
        const weiAmount = this.web3js.utils.toWei(amount, "ether");
        let tokenContract = new this.web3js.eth.Contract(EVMToken_abi, tokenAddress);
        return tokenContract.methods.approve(spender, weiAmount).send({from: this.web3js.currentProvider.selectedAddress});
    }

    depositTokens(amount, bridgeAdress, targetNetworkId) {
        const weiAmount = this.web3js.utils.toWei(amount, "ether");
        let bridgeContract = new this.web3js.eth.Contract(Bridge_abi, bridgeAdress);
        return bridgeContract.methods.depositTokens(weiAmount, targetNetworkId).send({from: this.web3js.currentProvider.selectedAddress});
    }

    burnTokens(amount, bridgeAdress, targetNetworkId) {
        const weiAmount = this.web3js.utils.toWei(amount, "ether");
        let bridgeContract = new this.web3js.eth.Contract(Bridge_abi, bridgeAdress);
        return bridgeContract.methods.burnTokens(weiAmount, targetNetworkId).send({from: this.web3js.currentProvider.selectedAddress});
    }

    transferEvent(web3Instance, tokenAddress, address) {
        return new web3Instance.eth.Contract(EVMToken_abi, tokenAddress).events.Transfer({filter: [{to: address}, {from: address}]});
    }
}
