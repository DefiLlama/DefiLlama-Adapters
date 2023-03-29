
const { sumTokensExport } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

module.exports = {
  start: 1579811423, // Thu, 23 Jan 2020 20:30:23 GMT
  ethereum: { tvl: sdk.util.sumChainTvls([
    '0xc59b0e4de5f1248c1140964e0ff287b192407e0c',
    '0x6f400810b62df8e13fded51be75ff5393eaa841f',
  ].map(addTvl)), }
};

function addTvl(owner) {
  const tokens = [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0x6810e776880c02933d47db1b9fc05908e5386b96',
    '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
    '0x57ab1ec28d129707052df4df418d58a2d46d5f51',
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    '0xa1d65E8fB6e87b60FECCBc582F7f97804B725521',
    '0xc00e94cb662c3520282e6f5717214004a7f26888',
    '0x514910771af9ca656af840dff83e8264ecf986ca',
    '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
    '0x22eEab2f980E8ed7824f8EA548C9595564a0F0e4',
    '0xe2f2a5c287993345a840db3b0845fbc70f5935a5',
    '0x0000000000085d4780B73119b644AE5ecd22b376',
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0x0b38210ea11411557c13457D4dA7dC6ea731B88a',
    '0x84cA8bc7997272c7CfB4D0Cd3D55cd942B3c9419',
  ]

  return sumTokensExport({ owner, tokens, })
}
