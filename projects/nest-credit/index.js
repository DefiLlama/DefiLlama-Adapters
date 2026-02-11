const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
    ethereum: {
        vaults: [
            '0x593cCcA4c4bf58b7526a4C164cEEf4003C6388db', // nALPHA
            '0xe72fe64840f4ef80e3ec73a1c749491b5c938cb9', // nTBILL
            '0x9fbC367B9Bb966a2A537989817A088AFCaFFDC4c', // nELIXIR
            '0x11113Ff3a60C2450F4b22515cB760417259eE94B', // nBASIS
            '0xbfc5770631641719cd1cf809d8325b146aed19de', // nINSTO
            '0xa5f78b2a0ab85429d2dfbf8b60abc70f4cec066c', // nCREDIT
            '0x29bF22381A5811deC89dC7b46A5Ce57aD02c0240',
            '0x119Dd7dAFf816f29D7eE47596ae5E4bdC4299165',
            '0x2A3e301dbd45c143DFbb7b1CE1C55bf0BBF161cb',
            '0x1639DcEc3ECE7F610F96a8935db6bCFfBCa2FBFb',
        ],
    },
    arbitrum: {
        vaults: [
            '0xe72fe64840f4ef80e3ec73a1c749491b5c938cb9', // nTBILL
        ],
    },
    bsc: {
        vaults: [
            '0x119Dd7dAFf816f29D7eE47596ae5E4bdC4299165',
            '0x1639DcEc3ECE7F610F96a8935db6bCFfBCa2FBFb',
        ],
        tokens: [ADDRESSES.bsc.USDT, ADDRESSES.bsc.USDC],
    },
    plasma: {
        vaults: [
            '0x119Dd7dAFf816f29D7eE47596ae5E4bdC4299165',
            '0x1639DcEc3ECE7F610F96a8935db6bCFfBCa2FBFb',
        ],
        tokens: [ADDRESSES.plasma.USDT0],
    },
}

module.exports = {
    methodology: 'TVL is the total value of assets deposited in Nest Credit vaults across all chains',
    doublecounted: true,
}


Object.keys(config).forEach(chain => {
    const { vaults, tokens } = config[chain]
    module.exports[chain] = {
        tvl: async (api) => sumTokens2({
            api,
            owners: vaults,
            tokens: tokens ?? [],
            fetchCoValentTokens: !tokens,
        })
    }
})