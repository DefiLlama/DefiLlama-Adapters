const { getBlock } = require('../helper/getBlock')
const sdk = require('@defillama/sdk')
const { fetchAssets } = require('../helper/terra')
const { transformHarmonyAddress, transformBscAddress } = require('../helper/portedTokens')

const data = {
    ethereum: {
        path: '/shuttle/eth.json'
    },
    bsc: {
        path: '/shuttle/bsc.json',
        transform: transformBscAddress()
    },
    harmony: {
        path: '/shuttle/hmy.json',
        transform: transformHarmonyAddress()
    },
}

function getTVLFunction(chain) {
   return async function tvl(timestamp, ethBlock, chainBlocks) {
        const balances = {}
        const chainData = data[chain];
        const block = await getBlock(timestamp, chain, chainBlocks);
        const chainTokens = await fetchAssets(chainData.path);

        const transform = 'transform' in chainData ? await chainData.transform : null;
        for (const [tokenAddress, chainAddress] of Object.entries(chainTokens.data.mainnet)) {
            const bridgedSupply = await sdk.api.erc20.totalSupply({ 
                block, chain, target: chainAddress
            });
            sdk.util.sumSingleBalance(balances, (transform ?? (id => id))(chainAddress), bridgedSupply.output)
        }
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
};
