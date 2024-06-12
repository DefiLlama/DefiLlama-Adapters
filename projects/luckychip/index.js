const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')
const { staking } = require("../helper/staking");

const tokenHolderMap = [
    {
      tokens: [],
      holders: [
        "0x45218EDE6f026F0994C55b6Fa3554A8Ea989f819" // BNB table
      ],
      checkETHBalance: true,
    },
    {
      tokens: ADDRESSES.bsc.USDT,   // USDT
      holders: [
        "0x682ce0e340A0248B4554E14e834969F2E421dB2D" // USDT table
      ],
    }
]

const WBNB = ADDRESSES.bsc.WBNB

function normalizeArray(arrayOrString){
    if(Array.isArray(arrayOrString)){
        return arrayOrString
    }else {
        return [arrayOrString]
    }
}

async function tvl(timestamp, ethBlock, chainBlocks) {
    const transform = i => `bsc:${i}`;
    const block = chainBlocks.bsc;

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
        methodology: 'TVL comes from the tables of LuckyChip for now.',
    bsc: {
        staking: staking(masterChef, lcToken),
        tvl,
    }
}
