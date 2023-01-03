const sdk = require('@defillama/sdk')
const { fetchAssets } = require('../helper/chain/terra')
const { getChainTransform } = require('../helper/portedTokens')

const data = {
    ethereum: {
        path: '/shuttle/eth.json'
    },
    bsc: {
        path: '/shuttle/bsc.json',
    },
    harmony: {
        path: '/shuttle/hmy.json',
    },
}

function getTVLFunction(chain) {
    return async function tvl(timestamp, ethBlock, {[chain]: block}) {
        const balances = {}
        const chainData = data[chain];
        const chainTokens = await fetchAssets(chainData.path);

        const transform = await getChainTransform(chain)
        const calls = Object.values(chainTokens.data.mainnet).map(t => ({ target: t }))
        const { output: results } = await sdk.api.abi.multiCall({ abi: 'erc20:totalSupply', calls, block, chain })
        results.forEach(({ input, output }) => sdk.util.sumSingleBalance(balances, transform(input.target), output))

        return balances
    }
}

module.exports = {
    methodology: "Sums tokens that are bridged (minted) to other chains via Terra Bridge (shuttle).",
    ethereum: {
        tvl: getTVLFunction('ethereum'),
    },
    bsc: {
        tvl: getTVLFunction('bsc'),
    },
    harmony: {
        tvl: getTVLFunction('harmony'),
    },
    hallmarks:[
        [1651881600, "UST depeg"],
      ],
};
