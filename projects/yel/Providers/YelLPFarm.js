const sdk = require("@defillama/sdk");
const abi = require("../config/abi.json");
const LP = require("./Base/LP");
const addr = require("../config/addresses.json");


module.exports = class YelLPFarm extends LP {
    constructor(farmingContract, network) {
        super(farmingContract, network);
    }

    async getPoolInfo() {
        try {
            const resp = await sdk.api.abi.call({
                abi: abi.poolInfo,
                chain: this.network,
                params: [1],
                target: this.lpFarmingContract,
            });
            this.totalLockedLPs = resp.output[1];
            this.lpTokenContract = resp.output[0];
        } catch (e) {
            console.warn(e);
        }
    }

    async unwrap() {
        await this.getPoolInfo();
        await this.calculateTokensLocked();
    }

    async getLockedYel() {
        const result = {};

        if (this.lpToken0.toLocaleLowerCase() === addr.tokens.ethereum.yel.toLocaleLowerCase()) {
            result[this.lpToken0] = this.token0InLP;
        }
        if (this.lpToken1.toLocaleLowerCase() === addr.tokens.ethereum.yel.toLocaleLowerCase()) {
            result[this.lpToken1] = this.token1InLP;
        }
        return result
    }

    static async nonYELTokensInLP(contract, network) {
        const obj = new YelLPFarm(contract, network)
        await obj.unwrap();
        return obj.getLockedTokens();
    }

    static async yelTokensInLp(contract, network) {
        const obj = new YelLPFarm(contract, network)
        await obj.unwrap();
        return obj.getLockedYel();
    }
}
