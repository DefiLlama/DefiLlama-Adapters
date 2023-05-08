const { nullAddress, treasuryExports } = require("../helper/treasury");
const AJP = "0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997"

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

const owners = {
    bsc: '0x12A65dFDD9E94Bd7f7547d1C4365c5c067f47ed0',
    arbitrum: '0x396B58574c0760E84E16468457c460bdCC6f8b57',
    polygon: '0xd7B2DEcAAcD75ADb92C1ee0C77e2303c815012d0',
    kava: '0xdBD5c57F3a0A6eFC7c9E91639D72Cc139c581AB4'
}

module.exports = treasuryExports({
    kava: {
        tokens: kava_tokens,
        owners: [owners.kava],
        ownTokens: [AJP]
    },
    bsc: {
      tokens: bsc_tokens,
      owners: [owners.bsc],
      ownTokens: [AJP],
    },
    polygon: {
        tokens: polygon_tokens,
        owners: [owners.polygon],
        ownTokens: [AJP]
    },
    arbitrum: {
        tokens: arb_tokens,
        owners: [owners.arbitrum],
        ownTokens: [AJP]
    }
  })