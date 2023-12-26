const BigNumber = require("bignumber.js");
const { post } = require('../helper/http')

module.exports = {
    timetravel: false,
    methodology: "STAKED",
    ton: {
        tvl: async () => {
            const requestBody = {
                "address": "EQD2_4d91M4TVbEBVyBF8J1UwpMJc361LKVCz6bBlffMW05o",
                "method": "get_pool_full_data",
                "stack": []
            }
            const response = await post('https://toncenter.com/api/v2/runGetMethod', requestBody)
            if (! response.ok)  {
                throw new Error("Unknown");
            }
            const result = response.result
            const tonTotalSupply = parseInt(result.stack[2][1], 16)
            return {"coingecko:the-open-network":  BigNumber(tonTotalSupply).div(1e9).toFixed(0)};
        }
    }
}
