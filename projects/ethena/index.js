const ADDRESSES = require('../helper/coreAssets.json')
const USDe = ADDRESSES.ethereum.USDe

module.exports = {
    ethereum: {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: USDe })
            api.add(USDe, supply)
        },
    }
}
