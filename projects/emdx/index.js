const sdk = require("@defillama/sdk");
const { getChainTransform } = require('../helper/portedTokens');

const insuranceFund = "0x80ce46804010C03387a13E27729c5FBb6a309105"
const clearingHouse = "0xBFB083840b0507670b92456264164E5fecd0430B"
const usdcAvalanche = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"

async function avalanche(_timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const underlyingBalances = await sdk.api.abi.multiCall({
        calls: [{
            target: usdcAvalanche,
            params: insuranceFund
        },{
            target: usdcAvalanche,
            params: clearingHouse
        }],
        block: chainBlocks.avalanche,
        abi: "erc20:balanceOf",
        chain: 'avax'
    });
    const usdc = (await getChainTransform('avax'))(usdcAvalanche);
    sdk.util.sumSingleBalance(balances, usdc, underlyingBalances.output[0].output)
    sdk.util.sumSingleBalance(balances, usdc, underlyingBalances.output[1].output)

    return balances
}

module.exports = {
    avax: {
        timetravel: false,
        tvl: avalanche
    }
}
