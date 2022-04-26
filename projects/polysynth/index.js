const sdk = require("@defillama/sdk");
const {transformPolygonAddress} = require('../helper/portedTokens');

const insuranceFund = "0x809F76d983768846acCbD8F8C9BDc240dC39bf8B"
const manager = "0xeC5ae95D4e9288a5C7c744F278709C56e9dC34eD"
const usdcMatic = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"

async function tvl(_timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const underlyingBalances = await sdk.api.abi.multiCall({
        calls: [{
            target: usdcMatic,
            params: insuranceFund
        },{
            target: usdcMatic,
            params: manager
        }],
        block: chainBlocks.polygon,
        abi: "erc20:balanceOf",
        chain: 'polygon'
    });
    const usdc = await (await transformPolygonAddress())(usdcMatic);
    sdk.util.sumSingleBalance(balances, usdc, underlyingBalances.output[0].output)
    sdk.util.sumSingleBalance(balances, usdc, underlyingBalances.output[1].output)

    return balances
}

module.exports = {    
    polygon: {
        tvl: tvl
    }    
}