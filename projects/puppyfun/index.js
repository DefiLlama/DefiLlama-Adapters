const ADDRESSES = require('../helper/coreAssets.json')
const BNB_ADDRESS = ADDRESSES.null
const FACTORIES = ['0xbFC5229ab471c54B58481fA232CFd4a18371C51C']

const factoryAbi = {
    allPairsLength: "function allPairsLength() view returns (uint256)",
    allPairs: "function allPairs(uint256) view returns (address)"
};

const pairAbi = {
    getReserves: "function getReserves() view returns (uint128, uint128)"
};

async function tvl(api) {
    for (let factory of FACTORIES) {
        console.log(`Started collecting TVL for factory ${factory} ...`)
        const pairsLen = await api.call({ abi: factoryAbi.allPairsLength, target: factory, params: [] })
        console.log(`Found ${pairsLen} pairs`)

        const pairsIndexes = [...Array(Number(pairsLen)).keys()]

        const allPairsCalls = pairsIndexes.map(index => ({
            target: factory,
            params: [index]
        }))
        
        const pairs = await api.multiCall({
            calls: allPairsCalls,
            abi: factoryAbi.allPairs,
        });

        const getReservesCalls = pairs.map(pair => ({
            target: pair,
            params: []
        }))

        const reservesBNB = await api.multiCall({
            calls: getReservesCalls,
            abi: pairAbi.getReserves,
        });

        const totalReservesForFactory = reservesBNB.reduce((sum, r) => sum + BigInt(r[1]), 0n)

        console.log(`BNB TVL for Factory: ${factory}: ${Number(totalReservesForFactory) / 10 ** 18} BNB`)
        api.add(BNB_ADDRESS, totalReservesForFactory)
    }
}

module.exports = {
    methodology: "TVL is counted as the total amount locked in PuppyFun smart contracts. In our particular case it is the total BNB amount in PuppyFun virtual DEX (all tokens which are not yet migrated). Calculated similarly to UniswapV2 based DEXes.",
    bsc: {
      tvl,
    },
}