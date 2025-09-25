const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, } = require('../helper/unwrapLPs')

const chainConfigs = {
    ethereum: {
        addr: "0x2eC37d45FCAE65D9787ECf71dc85a444968f6646",
        vault: ["0x1419b48e5C1f5ce413Cf02D6dcbe1314170E3386", "0x3A1FA847e2E69e278c6bfcA618a59Fdcf5923214"], //brBTC_vault, falcon address
        tokens: [
            ADDRESSES.ethereum.WBTC,//WBTC
            "0x004E9C3EF86bc1ca1f0bB5C7662861Ee93350568",//uniBTC
            ADDRESSES.mantle.FBTC,//FBTC
            ADDRESSES.ethereum.cbBTC,//cbBTC
            "0x2F913C820ed3bEb3a67391a6eFF64E70c4B20b19",//M-BTC
        ],
        staking: {
            symbiotic: {
                vault: "0x08F39b3d75712148dacDB2669C3EAcc7F1152547",
                owner: "0x1F3c54EC74F1A5C0Bc19af04dAdFa1A677231ac9", //safe wallet
                token: "0x004E9C3EF86bc1ca1f0bB5C7662861Ee93350568" //uniBTC
            },
        },
    },
    bsc: {
        addr: "0x733a6c29eDA4a58931AE81b8d91e29f2EAf01df3",
        vault: ["0x1dF46ec5e86FeC4589b3fA7D60B6Dc7Ef890AD93"],
        tokens: [
            ADDRESSES.bsc.BTCB,//BTCB
            "0x6B2a01A5f79dEb4c2f3c0eDa7b01DF456FbD726a",//uniBTC
            ADDRESSES.mantle.FBTC,//FBTC
            "0x9BFA177621119e64CecbEabE184ab9993E2ef727",//M-BTC
        ],
        staking: {
            kernel: {
                vault: "0x4F49f1d480D48AF660b7f4506bbB785AD5648726",
                owner: "0x1Ae02CD8a4566A4f2432857D7A943765D1e3E757",
                token: "0x9BFA177621119e64CecbEabE184ab9993E2ef727" //M-BTC
            },
        }
    },
}

module.exports = {
    methodology: 'brBTC standing for Bedrock BTC, is designed specifically for Bitcoin holders seeking to participate in the next generation of DeFi opportunities. It accepts uniBTC and multiple wrapped BTC assets and Bedrock manages those assets on multiple trusted yield source layers such as Babylon, Kernel, Pell, Satlayer and etc.',
    doublecounted: true,
    start: '2024-12-19',
}

async function tvl(api) {
    const cfg = chainConfigs[api.chain] ?? {}
    if (!cfg) return;

    // Handle kernel staking
    if (cfg.staking && cfg.staking.kernel) {
        const stakingCfg = cfg.staking.kernel
        const stakingBalance = await api.call({ abi: 'erc20:balanceOf', target: stakingCfg.vault, params: [stakingCfg.owner] })
        api.add(stakingCfg.token, stakingBalance)
    }

    // Handle symbiotic staking
    if (cfg.staking && cfg.staking.symbiotic) {
        const stakingCfg = cfg.staking.symbiotic
        const stakingBalance = await api.call({ abi: 'erc20:balanceOf', target: stakingCfg.vault, params: [stakingCfg.owner] })
        api.add(stakingCfg.token, stakingBalance)
    }

    return sumTokens2({ api, owners: cfg.vault, tokens: cfg.tokens })
}

['ethereum', 'bsc'].forEach(chain => {
    module.exports[chain] = { tvl: tvl }
})