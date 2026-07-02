const { sumTokens2, sumTokensExport, } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')
const token = {
  XWIN: '0xd88ca08d8eec1e9e09562213ae83a7853ebb5d28'
};

const farms = {
  MasterChefAddress: "0xD09774e3d5Dc02fa969896c53D3Cbb5bC8900A60",
  BuddyChefAddress: "0x4B87a60fC5a94e5ac886867977e29c9711C2E903",
  LockStakingAddress: "0xa4AE0DCC89Af9855946C0b2ad4A10FF27125a9Fc",
  PriceMasterAddr: "0xB1233713FeA0984fff84c7456d2cCed43e5e48E2",
};

const abi = {
  getVaultValues:
    "function getVaultValuesInUSD() public view returns (uint vaultValue)",
  poolLength: "function poolLength() view returns (uint)",
  poolInfoMaster:
    "function poolInfo(uint256) view returns (address, uint256, uint256, uint256, uint256, uint256)",
  balance: "function balanceOf(address) view returns (uint256)",
  decimals: "function decimals() view returns (uint8)",
  getPrice: "function getPrice(address, address) view returns (uint rate)",
};

const { MasterChefAddress, LockStakingAddress } = farms;
const { XWIN } = token;

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
      let vaults = (await getConfig('xWinFinance/vaults/' + api.chain, strategyUrl)).map(i => i.contractaddress)
      const privateVaults = await getConfig('xWinFinance/privateVaults', PrivateURL)

      vaults.push(...privateVaults[privateKey])
      if (portfolioURL) {
        const portfolioVaults = await getConfig('xWinFinance/portfolioVaults/' + api.chain, portfolioURL)
        vaults.push(...portfolioVaults.map(i => i.contractaddress))
      }


      const isValidVault = await api.multiCall({ abi: 'uint256:getVaultValues', calls: vaults, permitFailure: true })
      vaults = vaults.filter((_, i) => isValidVault[i])

      const bals = await api.multiCall({ abi: 'uint256:getVaultValues', calls: vaults, permitFailure: true })
      const tokens = await api.multiCall({ abi: 'address:baseToken', calls: vaults })
      const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens })


      //Get Vault Values returns 18 decimals even if the base token is not
      //For loop that removes the extra zeros if the base token is not 18 decimals.
      bals.forEach((bal, i) => bals[i] = (bal ?? 0) / 10 ** (18 - decimals[i]))

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
