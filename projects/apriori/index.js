const VAULT = '0x0c65A0BC65a5D819235B71F554D210D3F80E0852'; // aprMON ERC-4626 vault

async function tvl(api) {
  const total = await api.call({ abi: 'uint256:totalAssets', target: VAULT });
  api.addGasToken(total);
}

module.exports = {
  methodology: 'Total MON staked in the aPriori liquid staking vault, represented as aprMON (ERC-4626).',
  monad: { tvl },
};
