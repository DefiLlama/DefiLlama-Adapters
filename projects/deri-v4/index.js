const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')
const { transformBalances } = require('../helper/portedTokens')

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
  return transformBalances(api.chain, api.getBalances())
}

const config = {
  arbitrum: { fromBlock: 152219576, factory: '0xccacf05a3cb1770f9a5b5a8aa219af1ac0c5e26b', },
  era: { fromBlock: 19529699, factory: '0x34FD72D2053339EA4EB1a8836CF50Ebce91962D0', },
  linea: { fromBlock: 926110, factory: '0xe840Bb03fE58540841e6eBee94264d5317B88866', },
  scroll: { fromBlock: 1384607, factory: '0x7B56Af65Da221A40B48bEDcCb67410D6C0bE771D', },
  manta: { fromBlock: 1132047, factory: '0xc8fa78f6b68ab22239222b4249b1ff968d154ae9', },
  polygon_zkevm: { fromBlock: 8978690, factory: '0xc7e484c20d5dc5d33299afb430bfb5d17085ee98', },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})