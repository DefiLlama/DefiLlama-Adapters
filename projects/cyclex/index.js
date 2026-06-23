const ADDRESSES = require('../helper/coreAssets.json')

const config = {
    ethereum: {
        usdt: {
            token: ADDRESSES.ethereum.USDT,
            assets: [
                '0x6986e96285008a7e4A6366E7391C976A17B93eb2'
            ]
        },
    },
    avax: {
        usdt: {
            token: ADDRESSES.avax.USDt,
            assets: [
                '0xBE2b4CCdbEccFB5a88f1a331fe56f5FaC7Dbd409',
                '0x11d575518A7f9957DC82892971146e763a3E140e'
            ]
        },
    },
    ailayer: {
        bfbtc: {
            token: '0xC2236204768456B21eAfEf0d232Ba1FccCe59823',
            assets: [
                '0xDA8c0bb4c00C187c6DB4Cdb12ddf5b4a37B3e95d'
            ]
        },
    },
}

async function etherTvl(api) {
    const { token, assets } = config.ethereum.usdt
    const balances = await api.multiCall({ 
        abi: 'erc20:balanceOf', 
        calls: assets.map(v => ({
            target: token,
            params: [v]
        }))
    })
    api.add(token, balances)
}

async function avaxTvl(api) {
    const { token, assets } = config.avax.usdt
    const balances = await api.multiCall({ 
        abi: 'erc20:balanceOf', 
        calls: assets.map(v => ({
            target: token,
            params: [v]
        }))
    })
    api.add(token, balances)
}

async function ailayerTvl(api) {
    const { token, assets } = config.ailayer.bfbtc
    const balances = await api.multiCall({ 
        abi: 'erc20:balanceOf', 
        calls: assets.map(v => ({
            target: token,
            params: [v]
        }))
    })
    api.add(token, balances)
}

module.exports = {
    methodology: "TVL is fetched from asset address",
    ethereum: {
        tvl: etherTvl
    },
    avax: {
        tvl: avaxTvl
    },
    ailayer: {
        tvl: ailayerTvl
    },
}
