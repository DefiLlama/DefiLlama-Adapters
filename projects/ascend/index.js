// Ascend — liquid staking for 0G.
//
// a0G (0x4B3c...B4cB) is an ERC-4626 vault on Mellow's vault framework, deployed
// on 0G Mainnet (chain id 16661). Users deposit W0G and receive a0G shares; the
// W0G is locked in the vault's LayerZero OFT adapter and bridged to the Ascend
// Staked OG Mellow vault on Ethereum for restaking, so the vault contract itself
// holds almost no W0G. TVL is the W0G held by the vault, its OFT adapter and its
// withdrawal queue, which reconciles with the vault's `totalAssets()`.

const { sumTokens2 } = require('../helper/unwrapLPs')

const VAULT = '0x4B3c2f55fa67679b382c979A082Df1B32079B4cB' // a0G, ERC-4626
const W0G = '0x1Cd0690fF9a693f5EF2dD976660a8dAFc81A109c' // vault asset

async function tvl(api) {
  const [oftAdapter, withdrawalQueue] = await api.batchCall([
    { target: VAULT, abi: 'address:oftAdapter' },
    { target: VAULT, abi: 'address:withdrawalQueue' },
  ])
  return sumTokens2({ api, owners: [VAULT, oftAdapter, withdrawalQueue], tokens: [W0G] })
}

module.exports = {
  methodology:
    'TVL is the total W0G deposited into the Ascend a0G vault (0x4B3c2f55fa67679b382c979A082Df1B32079B4cB), ' +
    'counted as the W0G held by the vault, locked in its LayerZero OFT adapter (bridged to the Ascend Staked OG ' +
    'Mellow vault on Ethereum for restaking) and pending in its withdrawal queue.',
  start: 1770964817, // vault deployment, 0G block 24597844
  '0g': { tvl },
}
