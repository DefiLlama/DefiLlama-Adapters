const sdk = require("@defillama/sdk")
const abi = require('./abi.json');

const aztecRollupProcessor = '0x737901bea3eeb88459df9ef1BE8fF3Ae1B42A2ba'
// "getSupportedAssets" "getTotalDeposited" "getTotalPendingDeposit" "getTotalWithdrawn" "getTotalFees" 
const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' 

async function tvl(timestamp, ethBlock, chainBlocks) { 
    const balances = {}
  
    // Get aztec supported assets
    const { output: supportedAssets } = await sdk.api.abi.call({
        abi: abi['getSupportedAssets'],
        target: aztecRollupProcessor, 
        block: ethBlock, 
        chain: 'ethereum' 
    })

    // Get eth balance
    const { output: ethBalance } = await sdk.api.eth.getBalance({
        target: aztecRollupProcessor,
        block: ethBlock, 
        chain: 'ethereum' 
    });
    sdk.util.sumSingleBalance( balances, weth, ethBalance );
    
    // Get supported assets balances
    const assetsBalances = await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        calls: supportedAssets.map( asset => ({
            params: aztecRollupProcessor,
            target: asset,
        })), 
        block: ethBlock, 
        chain: 'ethereum' 
    })
    sdk.util.sumMultiBalanceOf( balances, assetsBalances, true);

    return balances
}

module.exports = {
  methodology: "TVL of Aztec consists of ethereum and supported assets (DAI and renBTC at the moment) locked into the rollup processor",
  ethereum: {
    tvl,
  }
}
