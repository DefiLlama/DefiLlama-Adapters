const deployment = require('./deployment.json');

async function staking(api) {
  if (api.chain !== deployment.chain) throw new Error('wrong_chain');
  const token = await api.call({ target: deployment.staking, abi: 'address:elo' });
  if (token.toLowerCase() !== deployment.elo.toLowerCase()) throw new Error('staking_token_changed');
  const principal = BigInt(await api.call({ target: deployment.staking, abi: 'uint256:totalStaked' }));
  const balance = BigInt(await api.call({ target: deployment.elo, abi: 'erc20:balanceOf', params: [deployment.staking] }));
  if (principal < 0n || balance < principal) throw new Error('staking_principal_not_backed');
  // Yield reserves and accidental transfers are not staked principal.
  api.add(deployment.elo, principal.toString());
}

module.exports = {
  start: 1794508798, // First staking contract code on Elysium, block 5489028.
  methodology: 'Staking reports ELO totalStaked principal, checked against token backing. Excludes unclaimed yield, donations, protocol-owned Reserve/Treasury assets and Uniswap LP positions. Core TVL is zero for this staking-only listing.',
  [deployment.chain]: { tvl: async () => ({}), staking },
};
