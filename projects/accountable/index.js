const ADDRESSES = require('../helper/coreAssets.json')

const VAULTS = ['0x4C0d041889281531fF060290d71091401Caa786D']
const convertToAssetsAbi = 'function convertToAssets(uint256) view returns (uint256)'

const tvl = async(api) => {
    const supply = await api.multiCall({ abi: 'erc20:totalSupply', calls: VAULTS })
    const assets = await api.multiCall({
        abi: convertToAssetsAbi,
        calls: VAULTS.map((vault, i) => ({ target: vault, params: [supply[i]] })),
    })
    api.add(ADDRESSES.monad.USDC, assets)
}

module.exports = { monad: { tvl } }