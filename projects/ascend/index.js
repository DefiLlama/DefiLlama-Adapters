// Ascend — liquid staking for 0G.
//
// a0G (0x4B3c...B4cB) is an ERC-4626 vault on Mellow's vault framework, deployed
// on 0G Mainnet (chain id 16661). Users deposit W0G and receive a0G shares; the
// underlying 0G is delegated to 0G validators and restaked via Symbiotic, so the
// vault contract itself holds almost no W0G (~70 W0G at time of writing against
// ~2.8M W0G of staked assets). Summing token balances would therefore report
// essentially zero, so TVL is read from the vault's own accounting via
// `totalAssets()`, denominated in the vault asset (W0G).

const VAULT = '0x4B3c2f55fa67679b382c979A082Df1B32079B4cB' // a0G, ERC-4626
const W0G = '0x1Cd0690fF9a693f5EF2dD976660a8dAFc81A109c' // vault asset

async function tvl(api) {
  const totalAssets = await api.call({ target: VAULT, abi: 'uint256:totalAssets' })
  api.add(W0G, totalAssets)
}

module.exports = {
  methodology:
    'TVL is the total 0G staked through the Ascend a0G vault, read on-chain as ' +
    'totalAssets() on the ERC-4626 vault (0x4B3c2f55fa67679b382c979A082Df1B32079B4cB) ' +
    'and valued in W0G. This covers the staked position delegated to 0G validators ' +
    'and restaked via Symbiotic, not just tokens idle in the contract.',
  start: 1770964817, // vault deployment, 0G block 24597844
  '0g': { tvl },
}
