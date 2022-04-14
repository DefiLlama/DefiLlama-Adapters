const { sumTokens } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')
const { getBlock } = require('../helper/getBlock');
const { transformBscAddress } = require('../helper/portedTokens');
const { stakingPricedLP } = require("../helper/staking");

const tokenHolderMap = [
    {
      tokens: [],
      holders: [
        "0xDF3E96a5d4A0C9AEf5F15C642Eb736E2A2f49630" // BNB table
      ],
      checkETHBalance: true,
    },
    {
      tokens: '0x55d398326f99059fF775485246999027B3197955',   // USDT
      holders: [
        "0x682ce0e340A0248B4554E14e834969F2E421dB2D" // USDT table
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

async function tvl(timestamp, ethBlock, chainBlocks) {
    const transform = await transformBscAddress();
    const block = await getBlock(timestamp, "bsc", chainBlocks);

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

const lcToken = '0x6012C3a742f92103d238F1c8306cF8fbcDEca8B3'
const masterChef = '0x15D2a6FC45aF66A2952dC27c40450C1F06A1eC2b';

// node test.js projects/luckychip/index.js
module.exports={
    misrepresentedTokens: false,
    methodology: 'TVL comes from the tables of LuckyChip for now.',
    bsc: {
        staking: stakingPricedLP(masterChef, lcToken, 'bsc', "0xA7610F4Ad54778f2108A6634d3cb9f8ff61923DE", "wbnb", true),
        tvl,
    }
}
