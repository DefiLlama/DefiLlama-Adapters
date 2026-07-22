const VAULTS = [
  '0x469201fA49DB171C0F95371533C2D3Ad5aE60400', // USDC AIHedge
];

async function tvl(api) {
  await api.erc4626Sum({ calls: VAULTS, isOG4626: true });
}

module.exports = {
  doublecounted: false,
  ethereum: {
    tvl,
  },
};
