const { sumTokens2, sumTokensExport, } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')
const { farms: { MasterChefAddress, LockStakingAddress }, abi, token: { XWIN } } = require('./Helper.js');

const PrivateURL = "https://us-central1-xwinfinance-main.cloudfunctions.net/getPrivateVaults"

const config = {
  bsc: {
    portfolioURL: "https://s3.ap-northeast-1.amazonaws.com/download.xwin.finance/v2-config/bsc/xwinfundv2.json",
    strategyUrl: 'https://s3.ap-northeast-1.amazonaws.com/download.xwin.finance/v2-config/bsc/xwinstrategies.json',
    privateKey: 'BNB',
  },
  arbitrum: {
    portfolioURL: "https://s3.ap-northeast-1.amazonaws.com/download.xwin.finance/v2-config/arb/xwinfundv2.json",
    strategyUrl: "https://s3.ap-northeast-1.amazonaws.com/download.xwin.finance/v2-config/arb/xwinstrategies.json",
    privateKey: 'ARB',
  },
  polygon: {
    strategyUrl: "https://s3.ap-northeast-1.amazonaws.com/download.xwin.finance/v2-config/polygon/xwinstrategies.json",
    privateKey: 'Polygon',
  },
}

Object.keys(config).forEach(chain => {
  const { portfolioURL, strategyUrl, privateKey, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = (await getConfig('xWinFinance/vaults/' + api.chain, strategyUrl)).map(i => i.contractaddress)
      const privateVaults = await getConfig('xWinFinance/privateVaults', PrivateURL)

      vaults.push(...privateVaults[privateKey])
      if (portfolioURL) {
        const portfolioVaults = await getConfig('xWinFinance/portfolioVaults/' + api.chain, portfolioURL)
        vaults.push(...portfolioVaults.map(i => i.contractaddress))
      }

      const bals = await api.multiCall({ abi: 'uint256:getVaultValues', calls: vaults })
      const tokens = await api.multiCall({ abi: 'address:baseToken', calls: vaults })
      const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens })


      //Get Vault Values returns 18 decimals even if the base token is not
      //For loop that removes the extra zeros if the base token is not 18 decimals.
      bals.forEach((bal, i) => bals[i] = bal / 10 ** (18 - decimals[i]))

      api.addTokens(tokens, bals)
    }
  }
})

async function pool2(api) {
  const data = await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.poolInfoMaster, target: MasterChefAddress, })
  return sumTokens2({ api, owner: MasterChefAddress, tokens: data.map(i => i[0]), resolveLP: true, blacklistedTokens: [XWIN, LockStakingAddress] })
}

module.exports.bsc.pool2 = pool2
module.exports.bsc.staking = sumTokensExport({ owners: [MasterChefAddress, LockStakingAddress], tokens: [XWIN] })
