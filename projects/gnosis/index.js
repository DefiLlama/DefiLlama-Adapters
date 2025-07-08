const ADDRESSES = require('../helper/coreAssets.json')

const { sumTokensExport } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

module.exports = {
  start: '2020-01-23', // Thu, 23 Jan 2020 20:30:23 GMT
  ethereum: { tvl: sdk.util.sumChainTvls([
    '0xc59b0e4de5f1248c1140964e0ff287b192407e0c',
    '0x6f400810b62df8e13fded51be75ff5393eaa841f',
  ].map(addTvl)), }
};

function addTvl(owner) {
  const tokens = [
    ADDRESSES.ethereum.WETH,
    ADDRESSES.ethereum.DAI,
    ADDRESSES.ethereum.USDC,
    ADDRESSES.ethereum.GNO,
    ADDRESSES.ethereum.YFI,
    ADDRESSES.ethereum.sUSD,
    ADDRESSES.ethereum.UNI,
    '0xa1d65E8fB6e87b60FECCBc582F7f97804B725521',
    '0xc00e94cb662c3520282e6f5717214004a7f26888',
    ADDRESSES.ethereum.LINK,
    ADDRESSES.ethereum.SUSHI,
    '0x22eEab2f980E8ed7824f8EA548C9595564a0F0e4',
    '0xe2f2a5c287993345a840db3b0845fbc70f5935a5',
    ADDRESSES.ethereum.TUSD,
    ADDRESSES.ethereum.USDT,
    '0x0b38210ea11411557c13457D4dA7dC6ea731B88a',
    '0x84cA8bc7997272c7CfB4D0Cd3D55cd942B3c9419',
  ]

  return sumTokensExport({ owner, tokens, })
}
