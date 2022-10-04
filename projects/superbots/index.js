const { sumTokens } = require('../helper/unwrapLPs')

const vault_tokens = [
    '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB
    '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c', // BTCB
    '0x2170ed0880ac9a755fd29b2688956bd959f933f8', // WETH
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
const allTokens = {
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

function tvl(chain) {
    return async (timestamp, block, chainBlocks) => {
        let tokensAndOwners = []
        for (let i = 0; i < vault_tokens.length; i++) {
            for (let j = 0; j < vaults.length; j++) {
                tokensAndOwners.push([vault_tokens[i],vaults[j]])
            }
        }
        const balances = {}
        return await sumTokens(balances, tokensAndOwners, block, chain)
    }
};

function staking(chain) {
    return async (timestamp, block, chainBlocks) => {
        const tokens = allTokens[chain]
        let tokensAndOwners = [
            [tokens.ubxt, tokens.stakingPool],
            [tokens.ubxtLP, tokens.stakingPool]
        ]
        
        const balances = {}
        return await sumTokens(balances, tokensAndOwners, block, chain)
    }
};

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    bsc: {
        tvl: tvl('bsc'),
        staking: staking('bsc')
    },
    ethereum: {
        staking: staking('ethereum')
    }
}