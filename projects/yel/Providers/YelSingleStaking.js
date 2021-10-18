const sdk = require("@defillama/sdk");
const abi = require("../config/abi.json");
const addr = require("../config/addresses.json")
module.exports = class YelSingleStaking {
    static async getStakedYel(farmingContract, network) {
        try {
            const resp = await sdk.api.abi.call({
                abi: abi.poolInfo,
                chain: network,
                params: [0],
                target: farmingContract,
            });
            return {
                [addr.tokens.ethereum.yel]: resp.output[1]
            }
        } catch (e) {
            console.warn(e);
            return {}
        }
    }
}
