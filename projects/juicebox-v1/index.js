const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// V1 Juicebox Terminals
const Terminal_V1 = "0xd569D3CCE55b71a8a3f3C418c329A66e5f714431";
const Terminal_v1_1 = "0x981c8ECD009E3E84eE1fF99266BF1461a12e5c68";
// Tokens
const ETH = ADDRESSES.null

module.exports = {
        methodology: "Count the value of the Ether in the Juicebox V1 terminals",
    ethereum:
    {
        start: '2021-07-15', // 2021-06-15 17:14:03 (UTC)
        tvl: async (_, block) => sumTokens2({
            block,
            tokensAndOwners: [
                [ETH, Terminal_V1],
                [ETH, Terminal_v1_1],
            ]
        })
    }
};
