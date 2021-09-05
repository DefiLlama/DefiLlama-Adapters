const sdk = require("@defillama/sdk");
const abi = require("../config/abi.json");

module.exports = class YelEnhancedSingleStake {
    static async getStakedTokens(contractAddress, network, key) {
        key = key || 'stakingTokenTotalAmount';
        try {
            const resp = await sdk.api.abi.call({
                abi: abi.poolInfo,
                params: [0],
                chain: network,
                target: contractAddress,
            });
            const staked = resp.output[key];
            const token = resp.output['stakingToken'];
            const prefix = network === "ethereum" ? "" : network+":"
            return {
                [prefix + token] : staked
            }
        } catch (e) {
            console.warn(e);
            return {};
        }
    }
}
