const sdk = require("@defillama/sdk");
const {transformPolygonAddress} = require('../helper/portedTokens');

const ethPool = "0x8e300739960457B532Af3bEd62475B790e0Dee5E"
const usdcPool = "0x05a37e1745926D8725A6C5dbD7Fd9873Dd9E356e"
const usdcMatic = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
const wethMatic = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"

async function tvl(_timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const underlyingBalances = await sdk.api.abi.multiCall({
        calls: [{
            target: usdcMatic,
            params: usdcPool
        },{
            target: wethMatic,
            params: ethPool
        }],
        block: chainBlocks.polygon,
        abi: "erc20:balanceOf",
        chain: 'polygon'
    });
    const usdc = await (await transformPolygonAddress())(usdcMatic);
    const eth = await (await transformPolygonAddress())(wethMatic);
    sdk.util.sumSingleBalance(balances, usdc, underlyingBalances.output[0].output)
    sdk.util.sumSingleBalance(balances, eth, underlyingBalances.output[1].output) 

    return balances
}

module.exports = {    
    polygon: {
        tvl: tvl
    }    
}