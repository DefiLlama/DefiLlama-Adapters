const LP = require("./Base/LP");
const sdk = require("@defillama/sdk");
const abi = require("../config/abi.json");

module.exports = class YelEnhancedLpFarm extends LP {
    constructor(farmingContract, network) {
        super(farmingContract, network);
    }

    async getLPTokenAddress() {
        try {
            const resp = await sdk.api.abi.call({
                abi: abi.externalFarming.lpToken,
                chain: this.network,
                target: this.lpFarmingContract,
            });
            this.lpTokenContract = resp.output;
        } catch (e) {
            console.warn(e);
        }
        return this;
    }

    async getLPTotalCount() {
        try {
            const resp = await sdk.api.abi.call({
                abi: abi.externalFarming.totalLP,
                chain: this.network,
                target: this.lpFarmingContract,
            });
            this.totalLockedLPs = resp.output;
        } catch (e) {
            console.warn(e);
        }
    }

    async unwrap() {
        await this.getLPTokenAddress();
        await this.getLPTotalCount();
        await this.calculateTokensLocked();
    }

    getTokensInLP() {
        const prefix = this.network === "ethereum" ? "" : this.network+":"
        return {
            [prefix+this.lpToken0]: this.token0InLP,
            [prefix+this.lpToken1]: this.token1InLP,
        }
    }

    static async tokensInLP(contract, network) {
        const obj = new YelEnhancedLpFarm(contract, network)
        await obj.unwrap();
        return obj.getTokensInLP();
    }
}
