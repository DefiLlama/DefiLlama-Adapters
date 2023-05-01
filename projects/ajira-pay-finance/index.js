const { staking } = require("../helper/staking");
const { getUniTVL } = require("../helper/unknownTokens.js");
const { sumTokens } = require('../helper/unwrapLPs')
const { sumTokensExport, nullAddress, } = require('../helper/unknownTokens')

const AJP_CONTRACT_ADDRESS = "0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997"
const KAVA_STAKING_CONTRACT = "0x894E327f11b09ab87Af86876dCfCEF40eA086f34"

const arb_tokens = [
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', 
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', '0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997'
]

const bsc_tokens = [
    '0x55d398326f99059fF775485246999027B3197955', '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD', '0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997'
]

const polygon_tokens = [
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    '0x0000000000000000000000000000000000001010', '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    '0x9C9e5fD8bbc25984B178FdCE6117Defa39d2db39', '0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997'
]

const kava_tokens = [
    '0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b', '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f',
    '0xB44a9B6905aF7c801311e8F4E76932ee959c663C', '0xEB466342C4d449BC9f53A865D5Cb90586f405215',
    '0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997'
]

const ethereum_tokens = [
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
]

const treasuries = [
    '0x98286347b1325a9D8e05A9f4D9D6009c888e13dA','0xb00375686741591FeB3541e1740E75FE21CD9f31',
    '0x7764EA261b62a55Af97Bf290F6ac77E8d647B996', '0xdBD5c57F3a0A6eFC7c9E91639D72Cc139c581AB4',
    '0x07871De755d9D922Cb1735A9F2418cBe9F1808EE', '0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997',
    '0xe68523CdeEC7bB76799d88f0913129733dbe7C48'
]

const kava_treasury = '0xdBD5c57F3a0A6eFC7c9E91639D72Cc139c581AB4'

async function tvlBSC(ttimestamp, _b, {bsc: block}){
    const balances = {}
    await sumTokens(balances, bsc_tokens.map(t=>treasuries.map(p=>[t,p])).flat(), block, 'bsc')
    return balances
}

async function tvlArbitrum(ttimestamp, _b, {arbitrum: block}){
    const balances = {}
    await sumTokens(balances, arb_tokens.map(t=>treasuries.map(p=>[t,p])).flat(), block, 'arbitrum')
    return balances
}

async function tvlPolygon(ttimestamp, _b, {polygon: block}){
    const balances = {}
    await sumTokens(balances, polygon_tokens.map(t=>treasuries.map(p=>[t,p])).flat(), block, 'polygon')
    return balances
}

async function tvlEthereum(ttimestamp, _b, {ethereum: block}){
    const balances = {}
    await sumTokens(balances, ethereum_tokens.map(t=>treasuries.map(p=>[t,p])).flat(), block, 'ethereum')
    return balances
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Ajira Pay Finance TVL Calculations are based on AJP KAVA Staking pool and treasury balances across all chains",
    bsc: {
        tvl: tvlBSC
    },
    ethereum: {
        tvl: sumTokensExport({ owner: treasuries[2],  tokens: 
            [ethereum_tokens[0], ethereum_tokens[1], ethereum_tokens[2], ethereum_tokens[3], ethereum_tokens[4], ethereum_tokens[5], nullAddress] })
    },
    polygon: {
        tvl: sumTokensExport({ owner: treasuries[2],  tokens: 
            [polygon_tokens[0], polygon_tokens[1], polygon_tokens[2], polygon_tokens[3], polygon_tokens[4], polygon_tokens[5], polygon_tokens[6], polygon_tokens[7], nullAddress] 
        })
    },
    arbitrum: {
        tvl: sumTokensExport({ owner: treasuries[2],  tokens: [arb_tokens[0], arb_tokens[1], arb_tokens[2], arb_tokens[3], arb_tokens[4], arb_tokens[5], nullAddress] })
    },
    kava: {
        staking: staking(KAVA_STAKING_CONTRACT, AJP_CONTRACT_ADDRESS, "kava"),
        tvl: sumTokensExport({ owner: kava_treasury,  tokens: [kava_tokens[0], kava_tokens[1], kava_tokens[2], kava_tokens[3], kava_tokens[4], nullAddress] })
    },
};