const ADDRESSES = require('../helper/coreAssets.json')

// mpETH was exploited on 2025-06-17: ERC4626 mint() let 9,785 mpETH be minted without any ETH
// (txs 0x4f43fc6d... and 0x57ee419a...). Meta Pool reissued the 814.29 pre-exploit mpETH as spETH
// in block 22776239 (2025-06-24) and the backing now sits in spETH. mpETH supply is frozen at
// 10,527 and its totalAssets is derived from that inflated supply, so it is no longer counted.
const MPETH = '0x48afbbd342f64ef8a9ab1c143719b63c2ad81710'
const SPETH = '0xd06f6a56c5f599cb375b616df306f32b7f6f4a0e'
const SPETH_LAUNCH_BLOCK = 22776239

async function tvl(api) {
  if (api.block && api.block < SPETH_LAUNCH_BLOCK) {
    const supply = await api.call({ abi: 'uint256:totalSupply', target: MPETH, })
    api.add(ADDRESSES.null, supply)
    return
  }
  const assets = await api.call({ abi: 'uint256:totalAssets', target: SPETH, })
  api.add(ADDRESSES.null, assets)
}

module.exports = {
  methodology: 'ETH staked in Meta Pool, read as spETH totalAssets. Before spETH launched (2025-06-24) it is the mpETH supply.',
  hallmarks: [['2025-06-17', 'mpETH free-mint exploit']],
  ethereum: {
    tvl
  }
}
