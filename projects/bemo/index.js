const BigNumber = require("bignumber.js");
const { post } = require('../helper/http')

module.exports = {
    timetravel: false,
    methodology: "stTon",
    ton: {
        tvl: async () => {
            const requestBody = {
                "address": "EQDNhy-nxYFgUqzfUzImBEP67JqsyMIcyk2S5_RwNNEYku0k",
                "method": "get_full_data",
                "stack": []
            }
            const response = await post('https://toncenter.com/api/v2/runGetMethod', requestBody)
            if (! response.ok)  {
                throw new Error("Unknown");
            }
            const result = response.result
            const tonTotalSupply = parseInt(result.stack[1][1], 16)
            return {"coingecko:the-open-network":  BigNumber(tonTotalSupply).div(1e9).toFixed(0)};
        }
    }
}
