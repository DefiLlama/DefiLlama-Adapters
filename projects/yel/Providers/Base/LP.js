const sdk = require("@defillama/sdk");
const abi = require("../../config/abi.json");
const addr = require("../../config/addresses.json");
const BigNumber = require("bignumber.js");

module.exports = class LP {
    /**
     * @type {"bsc"|"fantom"|"polygon"|"ethereum"}
     */
    network = "ethereum";
    lpFarmingContract = "";
    totalAmount1 = 0;
    totalAmount0 = 0;
    lpTokenContract = "";
    lpToken1 = "";
    lpToken0 = "";
    lpTotalSupply = 0;
    fraction1 = 1;
    fraction0 = 1;
    totalLockedLPs = 0;
    token1InLP = 0;
    token0InLP = 0;

    constructor(lpFarmingContract, network) {
        this.network = network;
        this.lpFarmingContract = lpFarmingContract;
    }

    async getTokensAmountInLp() {
        try {
            const resp = await sdk.api.abi.call({
                abi: abi.getReserves,
                chain: this.network,
                target: this.lpTokenContract,
            });
            this.totalAmount1 = resp.output[1];
            this.totalAmount0 = resp.output[0];
        } catch (e) {
            console.warn(e);
        }
    }

    /**
     * @param {1|0}index
     */
    async getLpToken(index) {
        const execAbi = index === 1 ? abi.externalFarming.token1 : abi.externalFarming.token0;
        try {
            const resp = await sdk.api.abi.call({
                abi: execAbi,
                chain: this.network,
                target: this.lpTokenContract,
            });
            let tokenAddr = resp.output
            if (resp.output.toLocaleLowerCase() === addr.tokens.bsc.yel) {
                tokenAddr = addr.tokens.ethereum.yel;
            }
            if (index === 0) {
                this.lpToken0 = tokenAddr;
            } else {
                this.lpToken1 = tokenAddr;
            }
        } catch (e) {
            console.warn(e);
        }
    }

    async getLPTotalSupply() {
        try {
            const resp = await sdk.api.abi.call({
                abi: abi.externalFarming.totalSupply,
                chain: this.network,
                target: this.lpTokenContract,
            });
            this.lpTotalSupply = resp.output;
        } catch (e) {
            console.warn(e);
        }
        return this;
    }

    getCoefToken0ToToken1() {
        BigNumber.config({EXPONENTIAL_AT: 100});
        this.fraction1 = new BigNumber(this.totalAmount1).div(this.lpTotalSupply).toNumber();
        this.fraction0 = new BigNumber(this.totalAmount0).div(this.lpTotalSupply).toNumber();
    }

    getTotalLockedTokens() {
        BigNumber.config({EXPONENTIAL_AT: 100});
        this.token1InLP = new BigNumber(this.totalLockedLPs)
            .multipliedBy(new BigNumber(this.fraction1))
            .toFixed(0);
        this.token0InLP = new BigNumber(this.totalLockedLPs)
            .multipliedBy(new BigNumber(this.fraction0))
            .toFixed(0);
    }

    async calculateTokensLocked() {
        await this.getTokensAmountInLp();
        await Promise.all([
            this.getLpToken(1),
            this.getLpToken(0)
        ])
        await this.getLPTotalSupply();
        this.getCoefToken0ToToken1();
        this.getTotalLockedTokens();
    }

    getLockedTokens() {
        const prefix = this.network === "ethereum" ? "" : this.network + ":";
        const result = {};

        if (this.lpToken0.toLocaleLowerCase() !== addr.tokens.ethereum.yel.toLocaleLowerCase()) {
            result[prefix + this.lpToken0] = this.token0InLP;
        }
        if (this.lpToken1.toLocaleLowerCase() !== addr.tokens.ethereum.yel.toLocaleLowerCase()) {
            result[prefix + this.lpToken1] = this.token1InLP;
        }
        return result
    }
}
