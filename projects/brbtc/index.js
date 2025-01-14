const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, } = require('../helper/unwrapLPs')

const chainConfigs = {
    ethereum: {
        addr: "0x2eC37d45FCAE65D9787ECf71dc85a444968f6646",
        vault: "0x1419b48e5C1f5ce413Cf02D6dcbe1314170E3386",
        assets: [
            ADDRESSES.ethereum.WBTC,//WBTC
            "0x004E9C3EF86bc1ca1f0bB5C7662861Ee93350568",//uniBTC
            "0xC96dE26018A54D51c097160568752c4E3BD6C364",//FBTC
            "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",//cbBTC
            "0x2F913C820ed3bEb3a67391a6eFF64E70c4B20b19",//MBTC
        ],
    },
    bsc: {
        addr: "0x733a6c29eDA4a58931AE81b8d91e29f2EAf01df3",
        vault: "0x1dF46ec5e86FeC4589b3fA7D60B6Dc7Ef890AD93",
        assets: [
            ADDRESSES.bsc.BTCB,//BTCB
            "0x6B2a01A5f79dEb4c2f3c0eDa7b01DF456FbD726a",//uniBTC
            "0xC96dE26018A54D51c097160568752c4E3BD6C364",//FBTC
        ],
    }
}
module.exports = {
    methodology: 'brBTC standing for Bedrock BTC, is designed specifically for Bitcoin holders seeking to participate in the next generation of DeFi opportunities. It accepts uniBTC and multiple wrapped BTC assets and Bedrock manages those assets on multiple trusted yield source layers such as Babylon, Kernel, Pell, Satlayer and etc.',
    doublecounted: true,
}

async function tvl(api) {
    const cfg = chainConfigs[api.chain] ?? {}
    if (!cfg) return;
    return sumTokens2({ api, owner: cfg.vault, tokens: cfg.assets })
}

['ethereum', 'bsc'].forEach(chain => {
    module.exports[chain] = { tvl: tvl }
})