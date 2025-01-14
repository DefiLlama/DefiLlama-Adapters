const ADDRESSES = require('../helper/coreAssets.json')

const AssetVault = '0x9485711f11B17f73f2CCc8561bcae05BDc7E9ad9';
const VaultStrategy = '0x396aBF9fF46E21694F4eF01ca77C6d7893A017B2';
const StoneOnManta = '0xEc901DA9c68E90798BbBb74c11406A32A70652C3';

const ethTvl = async (api) => {
    const strategyBal = await api.call({ abi: 'uint256:getAllStrategiesValue', target: VaultStrategy })
    api.add(ADDRESSES.null, strategyBal)
    return api.sumTokens({ owner: AssetVault, tokens: [ADDRESSES.null] })
}

const mantaTvl = async (api) => {
    const stoneAmount = await api.call({ abi: 'uint256:totalSupply', target: StoneOnManta })
    const stonePrice = await api.call({ abi: 'uint256:tokenPrice', target: StoneOnManta })
    const ethAmount = stoneAmount * stonePrice / 1e18
    return api.add(ADDRESSES.null, ethAmount)
}

module.exports = {
    ethereum: {
        tvl: ethTvl
    },
    // manta: {
    //     tvl: mantaTvl
    // }
}
