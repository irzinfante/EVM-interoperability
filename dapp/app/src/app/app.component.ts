import { Component } from '@angular/core';
import { FormControl, AbstractControl, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { Web3Service } from './web3.service';
import { environment } from '../environments/environment';
import { BSC_TESTNET_NETWORK, GOERLI_TESTNET_NETWORK, BESU_LOCAL_NETWORK } from './constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
    web3js: any;

    private currentNetworkId: any;
    currentAddress: any;

    originNetworkName: any;
    originBalance: any;

    private allowance: any;
    allowanceValid: any;

    targetNetworks: any;
    targetBalance: any;

    private originBalanceEvent: any;
    private targetBalanceEvent: any;

    constructor(private web3Service: Web3Service) {}
    Number = Number;

    bridgeForm = new FormGroup({
        amount: new FormControl('',
            (control: AbstractControl): ValidationErrors | null => {
                const isNumber = /^(0|([1-9][0-9]*))(\.[0-9]*[1-9])?$/.test(control.value);
                const invalid = !isNumber || parseFloat(control.value) <= 0 || parseFloat(control.value) > this.originBalance;
                return invalid ? {invalidAmount: {value: control.value}} : null;
            }
        ),
        targetNetworkId: new FormControl('0',
            (control: AbstractControl): ValidationErrors | null => {
                const invalid = control.value === "0";
                return invalid ? {invalidNetwork: {value: control.value}} : null;
            }
        )
    });

    connect() {
        this.web3Service.connectAccount().then(response => {
            this.web3js = response;

            this.currentNetworkId = parseInt(this.web3js.currentProvider.networkVersion);
            this.web3js.currentProvider.on("chainChanged", (chainId: number) => {
                this.currentNetworkId = parseInt(chainId.toString(), 16);
                this.updateOrigin();
                this.updateOriginBalanceEvent();
                this.clearTarget();
            });

            this.currentAddress = this.web3js.currentProvider.selectedAddress;
            this.web3js.currentProvider.on("accountsChanged", (accounts: string[]) => {
                this.currentAddress = accounts[0];
                this.updateOrigin();
                this.updateOriginBalanceEvent();
                this.updateTarget();
                this.updateTargetBalanceEvent();
            });

            this.updateOrigin();
            this.updateOriginBalanceEvent();
            this.clearTarget();
            this.checkAllowance();

        }).catch((error: any) => {
            console.error(error);
        });
    }

    async updateOrigin() {
        switch(this.currentNetworkId) {
            case BSC_TESTNET_NETWORK.id: {
                await this.web3Service.balanceOf(this.currentAddress, environment.BSC_EVM_TOKEN_ADDRESS, this.web3Service.web3BSC).then(result => { this.originBalance = parseFloat(result); });
                this.originNetworkName = BSC_TESTNET_NETWORK.name;
                break;
            }
            case GOERLI_TESTNET_NETWORK.id: {
                await this.web3Service.balanceOf(this.currentAddress, environment.GOERLI_EVM_TOKEN_ADDRESS, this.web3Service.web3Goerli).then(result => { this.originBalance = parseFloat(result); });
                this.originNetworkName = GOERLI_TESTNET_NETWORK.name;
                break;
            }
            case BESU_LOCAL_NETWORK.id: {
                await this.web3Service.balanceOf(this.currentAddress, environment.BESU_EVM_TOKEN_ADDRESS, this.web3Service.web3Besu).then(result => { this.originBalance = parseFloat(result); });
                this.originNetworkName = BESU_LOCAL_NETWORK.name;
                break;
            }
            default: {
                this.originBalance = 0;
                this.originNetworkName = "Uknown";
                break;
            }
        }
        this.bridgeForm.controls['amount'].setValue("");
    }

    changeTarget() {
        this.updateTarget();
        this.updateTargetBalanceEvent();
    }

    async updateTarget() {
        switch(parseInt(this.bridgeForm.value.targetNetworkId)) {
            case BSC_TESTNET_NETWORK.id: {
                await this.web3Service.balanceOf(this.currentAddress, environment.BSC_EVM_TOKEN_ADDRESS, this.web3Service.web3BSC).then(result => { this.targetBalance = parseFloat(result); });
                break;
            }
            case GOERLI_TESTNET_NETWORK.id: {
                await this.web3Service.balanceOf(this.currentAddress, environment.GOERLI_EVM_TOKEN_ADDRESS, this.web3Service.web3Goerli).then(result => { this.targetBalance = parseFloat(result); });
                break;
            }
            case BESU_LOCAL_NETWORK.id: {
                await this.web3Service.balanceOf(this.currentAddress, environment.BESU_EVM_TOKEN_ADDRESS, this.web3Service.web3Besu).then(result => { this.targetBalance = parseFloat(result); });
                break;
            }
            default: {
                this.targetBalance = 0;
                break;
            }
        }
    }

    clearTarget() {
        this.targetBalance = 0;
        this.bridgeForm.controls['targetNetworkId'].setValue("0");
        switch(this.currentNetworkId) {
            case BSC_TESTNET_NETWORK.id: {
                this.targetNetworks = [GOERLI_TESTNET_NETWORK, BESU_LOCAL_NETWORK];
                break;
            }
            case GOERLI_TESTNET_NETWORK.id: {
                this.targetNetworks = [BSC_TESTNET_NETWORK, BESU_LOCAL_NETWORK];
                break;
            }
            case BESU_LOCAL_NETWORK.id: {
                this.targetNetworks = [BSC_TESTNET_NETWORK, GOERLI_TESTNET_NETWORK];
                break;
            }
            default: {
                this.targetNetworks = [];
                break;
            }
        }
        this.updateTargetBalanceEvent();
    }

    async checkAllowance() {
        const isNumber = /^(0|([1-9][0-9]*))(\.[0-9]*[1-9])?$/.test(this.bridgeForm.value.amount);
        if(isNumber && this.currentNetworkId == BSC_TESTNET_NETWORK.id) {
            await this.web3Service.allowance(environment.BSC_EVM_TOKEN_ADDRESS, this.currentAddress, environment.BSC_BRIDGE_ADDRESS).then(result => { this.allowance = parseFloat(result); });
            if(this.allowance < parseFloat(this.bridgeForm.value.amount)) {
                this.allowanceValid = false;
            } else {
                this.allowanceValid = true;
            }
        } else {
            this.allowance = 0;
            this.allowanceValid = true;
        }
    }

    approveTokens() {
        if(this.currentNetworkId == BSC_TESTNET_NETWORK.id) {
            this.web3Service.approve(environment.BSC_EVM_TOKEN_ADDRESS, environment.BSC_BRIDGE_ADDRESS, this.bridgeForm.value.amount)
            .then((receipt) => {
                this.checkAllowance();
            });
        }
    }

    sendTokens() {
        switch(this.currentNetworkId) {
            case BSC_TESTNET_NETWORK.id: {
                this.web3Service.depositTokens(this.bridgeForm.value.amount, environment.BSC_BRIDGE_ADDRESS, parseInt(this.bridgeForm.value.targetNetworkId))
                .then((receipt) => {
                    this.updateOrigin();
                });
                break;
            }
            case GOERLI_TESTNET_NETWORK.id: {
                this.web3Service.burnTokens(this.bridgeForm.value.amount, environment.GOERLI_BRIDGE_ADDRESS, parseInt(this.bridgeForm.value.targetNetworkId))
                .then((receipt) => {
                    this.updateOrigin();
                });
                break;
            }
            case BESU_LOCAL_NETWORK.id: {
                this.web3Service.burnTokens(this.bridgeForm.value.amount, environment.BESU_BRIDGE_ADDRESS, parseInt(this.bridgeForm.value.targetNetworkId))
                .then((receipt) => {
                    this.updateOrigin();
                });
                break;
            }
            default: {
                break;
            }
        }
    }

    updateOriginBalanceEvent() {
        if(this.originBalanceEvent !== undefined) {
            this.originBalanceEvent.off('data');
        }
        switch(this.currentNetworkId) {
            case BSC_TESTNET_NETWORK.id: {
                this.originBalanceEvent = this.web3Service.transferEvent(this.web3Service.web3BSC, environment.BSC_EVM_TOKEN_ADDRESS, this.currentAddress);
                break;
            }
            case GOERLI_TESTNET_NETWORK.id: {
                this.originBalanceEvent = this.web3Service.transferEvent(this.web3Service.web3Goerli, environment.GOERLI_EVM_TOKEN_ADDRESS, this.currentAddress);
                break;
            }
            case BESU_LOCAL_NETWORK.id: {
                this.originBalanceEvent = this.web3Service.transferEvent(this.web3Service.web3Besu, environment.BESU_EVM_TOKEN_ADDRESS, this.currentAddress);
                break;
            }
            default: {
                this.originBalanceEvent = undefined;
                break;
            }
        }
        if(this.originBalanceEvent !== undefined) {
            this.originBalanceEvent.on('data', (event) => {
                this.updateOrigin();
            });
        }
    }

    updateTargetBalanceEvent() {
        if(this.targetBalanceEvent !== undefined) {
            this.targetBalanceEvent.off('data');
        }
        switch(parseInt(this.bridgeForm.value.targetNetworkId)) {
            case BSC_TESTNET_NETWORK.id: {
                this.targetBalanceEvent = this.web3Service.transferEvent(this.web3Service.web3BSC, environment.BSC_EVM_TOKEN_ADDRESS, this.currentAddress);
                break;
            }
            case GOERLI_TESTNET_NETWORK.id: {
                this.targetBalanceEvent = this.web3Service.transferEvent(this.web3Service.web3Goerli, environment.GOERLI_EVM_TOKEN_ADDRESS, this.currentAddress);
                break;
            }
            case BESU_LOCAL_NETWORK.id: {
                this.targetBalanceEvent = this.web3Service.transferEvent(this.web3Service.web3Besu, environment.BESU_EVM_TOKEN_ADDRESS, this.currentAddress);
                break;
            }
            default: {
                this.targetBalanceEvent = undefined;
                break;
            }
        }
        if(this.targetBalanceEvent !== undefined) {
            this.targetBalanceEvent.on('data', (event) => {
                this.updateTarget();
            })
        }
    }

}
