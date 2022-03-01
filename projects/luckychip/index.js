const { sumTokens } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')
const { getBlock } = require('../helper/getBlock');
const { transformBscAddress } = require('../helper/portedTokens');

tokenHolderMap = [
    {
      tokens: [],
      holders: [
        "0x61730d50624a89c0F8a864d32bb0eD2AaBA95bA5" // bnb table
      ],
      checkETHBalance: true,
    },
    {
      tokens: '0x55d398326f99059fF775485246999027B3197955',   // USDT
      holders: [
        "0x9A877744DFb9fB314FF5c50d34e4F8EfD7CfcB2b" // USDT table
      ],
    }
]

const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"

function normalizeArray(arrayOrString){
    if(Array.isArray(arrayOrString)){
        return arrayOrString
    }else {
        return [arrayOrString]
    }
}

async function tvl(timestamp, block, chainBlocks) {
    const transform = await transformBscAddress();
    block = await getBlock(timestamp, "bsc", chainBlocks);

    const tokensAndHolders = []
    let ethHolders = []
    for (const group of tokenHolderMap) {
        const holders = normalizeArray(group.holders);
        const tokens = normalizeArray(group.tokens)
        if (group.checkETHBalance === true) {
            ethHolders = ethHolders.concat(holders)
        }
        tokens.forEach(token => {
            holders.forEach(holder => {
                tokensAndHolders.push([token, holder])
            })
        })
    }

    const balances = {};
    await sumTokens(balances, tokensAndHolders, block, "bsc", transform);
    if (ethHolders.length > 0) {
        const ethBalances = await sdk.api.eth.getBalances({
            targets: ethHolders,
            block,
            chain: "bsc"
        })
        ethBalances.output.forEach(ethBal => {
            sdk.util.sumSingleBalance(balances, `bsc:${WBNB}`, ethBal.balance)
        })
    }
    return balances
}

// node test.js projects/luckychip/index.js
module.exports={
    misrepresentedTokens: false,
    methodology: 'TVL comes from the tables of LuckyChip for now.',
    bsc: {
        tvl
    }
}


