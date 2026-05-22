const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const vaults = [
    '0x29bF22381A5811deC89dC7b46A5Ce57aD02c0240', // nWISDOM
    '0x119Dd7dAFf816f29D7eE47596ae5E4bdC4299165', // nOPAL
    '0x2A3e301dbd45c143DFbb7b1CE1C55bf0BBF161cb', // nACRDX
]

const config = {
    ethereum: [ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.USDC],
    bsc: [ADDRESSES.bsc.USDT, ADDRESSES.bsc.USDC],
    plasma: [ADDRESSES.plasma.USDT0],
}

module.exports = {
    methodology: 'TVL is the total value of assets deposited in Nest Credit vaults across all chains',
}

Object.keys(config).forEach(chain => {
    module.exports[chain] = {
        tvl: async (api) => sumTokens2({
            api,
            owners: vaults,
            tokens: config[chain],
        })
    }
})