const { treasuryExports } = require('../helper/treasury');
const ADDRESSES = require('../helper/coreAssets.json')

// Protocol-operated Fireblocks MPC custody wallets that back TurboFlow
// user deposits and settlement obligations. These EOA/safe-style balances
// are tracked separately from the bridge-contract TVL exported by
// `projects/turboflow/index.js`, in line with DefiLlama's policy of not
// counting EOA/safe holdings toward TVL.

module.exports = treasuryExports({
  bsc: {
    tokens: [ADDRESSES.bsc.USDT, ADDRESSES.bsc.USDC],
    owners: ["0x8757f9E16d775759671e95e50D749CECCDA375AE", "0x077Ab3f5D4372cA14c6AA417215Af3d91B55bAFc"],
  },
  solana: {
    tokens: [ADDRESSES.solana.USDT, ADDRESSES.solana.USDC],
    owners: ['6FaXzEC4CNAh1ECxc8FUnjpcnMYYG4M7DVJ5ZMbTmcWH', '4wHLLe6ovPqmGoBjvk6ogxgFbiGMCUUPvnMqmxyprX5C'],
  }
})