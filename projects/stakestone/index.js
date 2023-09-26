const ADDRESSES = require('../helper/coreAssets.json')

const AssetVault = '0x9485711f11B17f73f2CCc8561bcae05BDc7E9ad9';
const VaultStrategy = '0x396aBF9fF46E21694F4eF01ca77C6d7893A017B2';

const ethTvl = async (timestamp, block, _, { api }) => {
    const strategyBal = await api.call({ abi: 'uint256:getAllStrategiesValue', target: VaultStrategy })
    api.add(ADDRESSES.null, strategyBal)
    return api.sumTokens({ owner: AssetVault, tokens: [ADDRESSES.null]})
}

module.exports = {
    start: 18182242,
    ethereum: {
        tvl: ethTvl
    },
}
