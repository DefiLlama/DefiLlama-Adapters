const ADDRESSES = require('../helper/coreAssets.json')

const vaults = [
  {
    vault: '0x741bD193B6b40f8703d2e116FD1965421f290F58',
    underlying: ADDRESSES.ethereum.USDC,
  },
  {
    vault: '0x501eBf66d76A96D4FB26ccead42957653e16B8B8',
    underlying: ADDRESSES.ethereum.USDT,
  },
  {
    vault: '0xdBECD077c1C2feFDCB75f547d1b5a73BF8207e4C',
    underlying: ADDRESSES.ethereum.WETH,
  },
]

async function tvl(api) {
  const balances = await api.multiCall({
    abi: 'uint256:totalAssets',
    calls: vaults.map(({ vault }) => vault),
    permitFailure: true,
  })

  balances.forEach((balance, index) => {
    if (balance) api.add(vaults[index].underlying, balance)
  })
}

module.exports = {
  methodology:
    'TVL is the outstanding underlying asset amount tracked by eva vault totalAssets() on Ethereum mainnet.',
  start: '2026-03-24',
  ethereum: {
    tvl,
  },
}
