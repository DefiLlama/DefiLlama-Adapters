
const { get } = require('./helper/http');
const { compoundExports2 } = require('./helper/compound');
const { mergeExports } = require('./helper/utils');
const { sumTokensExport } = require('./helper/unwrapLPs');
const ADDRESSES = require('./helper/coreAssets.json')

const config = {
  ontology: {
    url: 'https://flashapi.wing.finance/api/v1/flashpooldetail',
  },
}

const apiExports = {
  misrepresentedTokens: true,
};

const data = {}

async function getData(chain) {
  const { url } = config[chain]
  if (!data[chain]) data[chain] = get(url)
  return data[chain]
}

Object.keys(config).forEach(chain => {
  apiExports[chain] = {
    tvl: async () => {
      const { result } = await getData(chain)
      if (!result.totalBorrow) result.totalBorrow = result.TotalBorrow
      if (!result.totalSupply) result.totalSupply = result.TotalSupply
      
      return {
        tether: result.totalSupply - result.totalBorrow
      }
    },
    staking: async () => {
      const { result } = await getData(chain)
      if (!result.totalLockedWingDollar) result.totalLockedWingDollar = result.TotalLockedWingDollar
      if (result.totalLockedWingDollar == undefined) result.totalLockedWingDollar = 0
      if (result.totalInsurance != undefined && !result.totalInsurance) result.totalLockedWingDollar += result.totalInsurance
      return {
        tether: result.totalLockedWingDollar
      }
    },
    borrowed: async () => {
      const { result } = await getData(chain)
      if (!result.totalBorrow) result.totalBorrow = result.TotalBorrow
      return {
        tether: result.totalBorrow
      }
    },
  }
})


module.exports = mergeExports([
  {  // flash pool
    ethereum: compoundExports2({ comptroller: '0x2F9fa63066cfA2d727F57ddf1991557bA86F12c9' }),
    okexchain: compoundExports2({ comptroller: '0x66e212d287e547c2c93cfe50795543c025ca9ee3' }),
    bsc: compoundExports2({ comptroller: '0x49620e9bfd117c7b05b4732980b05b7afee60a69' }),
    ontology_evm: compoundExports2({ comptroller: '0x000A4d6b9E553a7f4bc1B8F94bB7Dd37BfF6d79b' }),
  }, {  // p2p pool
    ethereum: {
      tvl: sumTokensExport({
        owner: '0x091806040FD70B40bcDA5e01D00eAfad8D10AB56',
        tokens: [
          ADDRESSES.ethereum.DAI,
          ADDRESSES.ethereum.WETH,
          '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
          '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
          ADDRESSES.ethereum.USDT,
          '0x70e36f6BF80a52b3B46b3aF8e106CC0ed743E8e4',
          '0xc00e94Cb662C3520282E6f5717214004A7f26888',
          '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
        ]

      })
    },
  }, {  // nft pool
    ethereum: {
      tvl: sumTokensExport({
        owner: '0x3c3e283353f4349f6424151583A8353E8F40F2B1',
        tokens: [
          ADDRESSES.ethereum.WETH,
        ]

      })
    },
  },
  apiExports,
])