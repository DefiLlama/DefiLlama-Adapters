const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

const vault_tokens = [
    ADDRESSES.bsc.BUSD, // BUSD
    ADDRESSES.bsc.WBNB, // WBNB
    ADDRESSES.bsc.BTCB, // BTCB
    ADDRESSES.bsc.ETH, // WETH
]
const vaults = [
    '0x4558684869b1f814b4d8b177dcb0a2e10f4e007d',
    '0xc645D32bb7D9592a268387755B2864FF146924f7',
    '0x5b3da1932d68a1569de973731e87f0796af21d0a',
    '0x99ef199afae20f4efb30f420c6c401fac3137e4d',
    '0x1345a7cb4f00c844b9f466fe065a6ae2a2c68273',
    '0x76651E8282739F47cfAaB65f10e4A9AC68EC3C7F',
    '0x923c7C2bb7329372898ef0F820d2dCF010561D6b',
    '0x6f073b79a7e59547cd3f0472606b1e349049a5e7',
    '0x711D6C0f87f1Ddd8B2589f50a5b7E8F02BD61990'
]
const config = {
    'bsc': {
        ubxt: '0xbbeb90cfb6fafa1f69aa130b7341089abeef5811',
        stakingPool: '0x2500C97d1eBD63275DdC3511c825c4d73335Cb77',
        ubxtLP: '0x8d3ff27d2ad6a9556b7c4f82f4d602d20114bc90'
    },
    'ethereum': {
        ubxt: '0x8564653879a18C560E7C0Ea0E084c516C62F5653',
        stakingPool: '0x6f87364176265cad6ffc70ad2a795630395a8c24',
        ubxtLP: '0x6a928D733606943559556F7eb22057C1964ce56a'
    }
}

async function tvl(api) {
    return sumTokens2({ owners: vaults, tokens: vault_tokens, api })
}

module.exports = {
    bsc: {
        tvl,
        staking: staking(config.bsc.stakingPool, config.bsc.ubxt),
        pool2: staking(config.bsc.stakingPool, config.bsc.ubxtLP),
    },
    ethereum: {
        staking: staking(config.ethereum.stakingPool, config.ethereum.ubxt,),
        pool2: staking(config.ethereum.stakingPool, config.ethereum.ubxtLP,),
    }
}