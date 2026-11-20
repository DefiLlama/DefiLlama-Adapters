
const IPBOND_TOKEN = '0x0f208c118e06ADdE57FbA26F04E6aD28d2D5e446';

async function tvl(api) {
  const totalSupply = await api.call({
    abi: 'erc20:totalSupply',
    target: IPBOND_TOKEN,
  });

  api.add(IPBOND_TOKEN, totalSupply);
}

module.exports = {
  methodology: 'TVL represents the outstanding principal of IPBOND202709, calculated from its onchain totalSupply. Each token represents USD 1 of subscribed principal, originally funded with USDC.e or ipUSD. The subscription is fully completed, and the proceeds are currently held in a management multisig wallet on Soneium. The funds may subsequently be transferred cross-chain to DayOneDream. Outstanding IPBOND continues to represent the principal obligation until redemption. Redeemed tokens are burned, reducing totalSupply. Accrued interest is excluded. This metric represents outstanding principal, not assets continuously held by the sale contract.',
  doublecounted: true,
  start: '2026-11-17',
  soneium: {
    tvl,
  },
};
