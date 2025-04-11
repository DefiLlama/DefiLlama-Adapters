const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

async function tvl(api) {
  const { factory, fromBlock, } = config[api.chain]
  const logs = await getLogs({
    api,
    target: factory,
    eventAbi: 'event AddBToken(address bToken, address vault, bytes32 oracleId, uint256 collateralFactor)',
    onlyArgs: true,
    fromBlock,
  })
  const vaults = logs.map(log => log.vault)
  const bals = await api.multiCall({ abi: 'function stTotalAmount() external view returns (uint256 balance)', calls: vaults })
  let tokens = await api.multiCall({ abi: 'function asset() external view returns (address)', calls: vaults })
  tokens = tokens.map(token => token === ADDRESSES.linea.WETH_1 ? ADDRESSES.null : token)

  const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens, permitFailure: true })
  api.addTokens(tokens, bals.map((v, i) => v / 10 ** (18 - (decimals[i] ?? 18))))
}

const config = {
  arbitrum: { fromBlock: 154160066, factory: '0x7C4a640461427C310a710D367C2Ba8C535A7Ef81', },
  era: { fromBlock: 19529699, factory: '0x34FD72D2053339EA4EB1a8836CF50Ebce91962D0', },
  linea: { fromBlock: 926110, factory: '0xe840Bb03fE58540841e6eBee94264d5317B88866', },
  scroll: { fromBlock: 1384607, factory: '0x7B56Af65Da221A40B48bEDcCb67410D6C0bE771D', },
  manta: { fromBlock: 1132047, factory: '0xc8fa78f6b68ab22239222b4249b1ff968d154ae9', },
  polygon_zkevm: { fromBlock: 8978690, factory: '0xc7e484c20d5dc5d33299afb430bfb5d17085ee98', },
  taiko: { fromBlock: 130174, factory: '0xd4E08C940dDeC162c2D8f3034c75c3e08f1f6032', },
  bsc: { fromBlock: 37069498, factory: '0x2c2E1eE20C633EAe18239c0BF59cEf1FC44939aC', },
  blast: { fromBlock: 2304573, factory: '0x60138081198b75aAF15ACA3A17Ec7f5Ffc5D4605', },
  base: { fromBlock: 25285725, factory : '0xd4E08C940dDeC162c2D8f3034c75c3e08f1f6032', },
  sonic: { fromBlock: 13168450, factory: '0x35EE168B4d0EA31974E9B184480b758F3E9940D1', },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})