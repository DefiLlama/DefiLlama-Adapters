const { staking } = require("../helper/staking");
const { sumTokensExport, nullAddress, } = require('../helper/unknownTokens')

const AJP_CONTRACT_ADDRESS = "0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997"
const KAVA_STAKING_CONTRACT = "0xE6B06E3cBfDFe6AAc5e18C2eE1bFF53dFD276B39"

const arb_tokens = [
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', 
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', '0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997',
    '0x912CE59144191C1204E64559FE8253a0e49E6548',
    nullAddress
]

const bsc_tokens = [
    '0x55d398326f99059fF775485246999027B3197955', '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD', '0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997',
    nullAddress
]

const polygon_tokens = [
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    '0x0000000000000000000000000000000000001010', '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    '0x9C9e5fD8bbc25984B178FdCE6117Defa39d2db39', '0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997',
    nullAddress
]

const kava_tokens = [
    '0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b', '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f',
    '0xB44a9B6905aF7c801311e8F4E76932ee959c663C', '0xEB466342C4d449BC9f53A865D5Cb90586f405215',
    '0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997',
    nullAddress
]

const ethereum_tokens = [
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    nullAddress
]

const owners = {
    bsc: '0x12A65dFDD9E94Bd7f7547d1C4365c5c067f47ed0',
    arbitrum: '0x396B58574c0760E84E16468457c460bdCC6f8b57',
    polygon: '0xd7B2DEcAAcD75ADb92C1ee0C77e2303c815012d0',
    kava: '0xdBD5c57F3a0A6eFC7c9E91639D72Cc139c581AB4'
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Ajira Pay Finance TVL Calculations are based on AJP KAVA Staking pool and treasury balances across all chains",
    bsc: {
        tvl:  sumTokensExport({ owner: owners.bsc,  tokens: bsc_tokens })
    },
    polygon: {
        tvl: sumTokensExport({ owner: owners.polygon,  tokens: polygon_tokens})
    },
    arbitrum: {
        tvl: sumTokensExport({ owner: owners.arbitrum,  tokens: arb_tokens })
    },
    kava: {
        staking: staking(KAVA_STAKING_CONTRACT, AJP_CONTRACT_ADDRESS, "kava"),
        tvl: sumTokensExport({ owner: owners.kava,  tokens: kava_tokens })
    }
};
