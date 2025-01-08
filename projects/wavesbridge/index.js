const sdk = require('@defillama/sdk');
const solana = require('../helper/solana');
const waves = require("../helper/chain/waves");
const { assetBalance } = require("../helper/chain/waves");
const { sumTokens } = require("../helper/chain/waves");
const { default: BigNumber } = require('bignumber.js');
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs');
const NATIVE_ADDRESS = nullAddress;

const data = {
    bsc: {
        contractAddress: "0x3AC7A6635d99F376c3c05442f7Eef62d349C3A55",
        tokens: [
            {name: "DOGE", address: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43", decimals: 8},
            {name: "Real Games", address: "0x873CD8702d18Eb584CCdFFc10a5B88d62606cEEF", decimals: 18},
        ]
    },
    ethereum: {
        contractAddress: "0x3AC7A6635d99F376c3c05442f7Eef62d349C3A55",
        tokens: [
            {name: "Real Games", address: "0x1a920b0eaE5B49c51eBf042a61c3Fa58Dae04882", decimals: 18},
            {name: "SHIB", address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", decimals: 18},
            {name: "PEPE", address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933", decimals: 18},
            {name: "APE", address: "0x4d224452801ACEd8B2F0aebE155379bb5D594381", decimals: 18},
            {name: "NEIRO", address: "0x812Ba41e071C7b7fA4EBcFB62dF5F45f6fA853Ee", decimals: 9},
        ]
    },
    unit0: {
        contractAddress: "0x3AC7A6635d99F376c3c05442f7Eef62d349C3A55",
        tokens: [
            {name: "USDC", address: "0xEb19000D90f17FFbd3AD9CDB8915D928F4980fD1", decimals: 6},
            {name: "USDT", address: "0xb303d80db8415FD1d3C9FED68A52EEAc9a052671", decimals: 6},
            {name: "WETH", address: "0x1B100DE3F13E3f8Bb2f66FE58c1949c32E71248B", decimals: 18},
            {name: "WBTC", address: "0x9CE808657ba90C65a2700b1cA5D943eC72834B52", decimals: 8},
        ]
    },
}

const solanaData = {
    contractAddress: '7wEDvcNJoW32NohRnEWNBfxNDKky58DWmcvonEpzyLvF',
    tokens: [
        {name: "SPX6900", tokenAccount: '5LwYpWHBbTTWiqCBSrgnECkFErGUij7qBy4ThnT2CBjR'},
        {name: "BONK", tokenAccount: '9cHvxaunL2nBSTsEwkE4vdSiDDvkXbQ8F5t8MX5HDXBE'},
        {name: "dogwifhat", tokenAccount: 'Bu87s81PicPN5zjgs4McMRsj7de3iCUJLCEvXPH2gZyk'},
        {name: "GOAT", tokenAccount: 'Hdj3SbVvDWT72oikuHzo7L2BL59LZ8J13Q5WAqctRZPV'},
        {name: "POPCAT", tokenAccount: '81AoJifka9eJYAxYqT9Aqd5UNLp98taAmUEsgCBLrNGn'},
        {name: "CHILLGUY", tokenAccount: 'EAGMkFb42CmyPs18CotJshrhKhZd3kY2P4weeYUCjd5e'},
        {name: "BOME", tokenAccount: '4DJY8y8h6YavPVyGHTdGEa1WU8Zk6X7r1PM81nmSCm3T'},
    ]
}

const wavesData = {
    contractAddress: "3P6Rk2XBo6MJm9seLfxvJ1VSGz54yWiYb9U",
    tokens: [
        {name: "L2MP", address: "7scqyYoVsNrpWbTAc78eRqNVcYLxMPzZs8EQfX7ruJAg", decimals: 8},
        {name: "ROME", address: "AP4Cb5xLYGH6ZigHreCZHoXpQTWDkPsG2BHqfDUx6taJ", decimals: 6},
        {name: "PETE", address: "GAzAEjApmjMYZKPzri2g2VUXNvTiQGF7KDYZFFsP3AEq", decimals: 8},
        {name: "WX", address: "Atqv59EYzjFGuitKVnMRk6H8FukjoV3ktPorbEys25on", decimals: 8},
        {name: "WAVES", address: NATIVE_ADDRESS},
    ]
}


const toNumber = (decimals, n) => BigNumber(n/(10 ** decimals)).toFixed(0)

function getTVLFunction(chain) {
    return async function tvl(api) {
        const chainData = data[chain];
        const tokens = chainData.tokens.map(i => i.address)
        return sumTokens2({ api, tokens, owner: chainData.contractAddress })
    }
}

async function solanaTvl() {
    return solana.sumTokens2({ tokenAccounts: solanaData.tokens.map(i => i.tokenAccount)})
}

async function wavesTvl(api) {
    return waves.sumTokens({ owners: [wavesData.contractAddress], api: api , includeWaves: true, blacklistedTokens: [] })
}

module.exports={
    methodology: "All tokens locked in WavesBridge smart contracts.",
    timetravel: false,
    waves: {
        tvl: wavesTvl,
    },
    solana: {
        tvl: solanaTvl,
    },
}

Object.keys(data).forEach(chain => {
    module.exports[chain] = {
        tvl: getTVLFunction(chain)
    }
})
