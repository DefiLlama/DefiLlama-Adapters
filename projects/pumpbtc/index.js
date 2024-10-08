const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require('../helper/sumTokens');
const utils = require('../helper/utils');
const { getConfig } = require('../helper/cache')

module.exports = {
  methodology: 'TVL for pumpBTC is calculated based on the total value of WBTC, FBTC, BTCB held in the contract that were utilized in the minting process of pumpBTC.',
}
const config = {
  ethereum: { owners: ['0x1fCca65fb6Ae3b2758b9b2B394CB227eAE404e1E', '0x3d9bCcA8Bc7D438a4c5171435f41a0AF5d5E6083', '0xAC364d14020f1da0044699691a91f06ca6131Fe3', '0x1fCca65fb6Ae3b2758b9b2B394CB227eAE404e1E'], tokens: ['0xC96dE26018A54D51c097160568752c4E3BD6C364', ADDRESSES.ethereum.WBTC], },
  bsc: { owners: ['0x2Ee808F769AB697C477E0aF8357315069b66bCBb', '0x80922aD2771c5Ea9C14bA5FF4a903EC6B0f7e7C9', '0x2b4B9047C9fEA54705218388bFC7Aa7bADA4BB5E', '0x8A0727B87fa1027c419c3aa2caf56C799d5Bd8c5'], tokens: [ADDRESSES.bsc.BTCB, '0xC96dE26018A54D51c097160568752c4E3BD6C364'], },
  mantle: { owners: ['0xd6Ab15B2458B6EC3E94cE210174d860FdBdd6b96'], tokens: ['0xC96dE26018A54D51c097160568752c4E3BD6C364'], },
  bitcoin: {},
}

Object.keys(config).forEach(chain => {
  const { owners, tokens, } = config[chain]

  if (chain === 'bitcoin') {
    module.exports[chain] = {
      tvl:
        async (api) => {
          const addresses = await getConfig('pumpbtc', undefined, { fetcher: getStakingAddresses })
          return sumTokens({ api, owners: addresses })
        }
    }
  } else {
    module.exports[chain] = {
      tvl: async (api) => api.sumTokens({ owners, tokens })
    }
  }
})

async function getStakingAddresses() {
  let res = await utils.fetchURL('https://dashboard.pumpbtc.xyz/api/dashboard/btc/addresses')

  const btcAddresses = res.data.data || []
  //console.log('>>', btcAddresses.length) 
  return btcAddresses
}

module.exports.isHeavyProtocol = true
