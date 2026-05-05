// MixyMon — privacy pool dApp on Monad mainnet (chainId 143).
//
// Each pool is a fixed-denomination, Tornado-style shielded pool that holds
// only native MON: deposits require msg.value == denomination, withdrawals
// pay out via low-level call{value: ...}. There are no ERC-20s, LP tokens,
// or derivatives in any pool, so TVL is the sum of native MON held by the
// four pool contracts.

const POOLS = [
  '0xE5f5d328f8C4e46578011F88B5c6a52c914e4f80', //     200 MON pool
  '0xDb51fe0b98928E52F7C4a928C24F43823D2450CA', //   2,000 MON pool
  '0xb714968DBf9662c9eAbD556dABf6B1c50d4b0e0e', //  20,000 MON pool
  '0xEF724039825DE7D9E71081C0663E2A73554c904B', // 200,000 MON pool
];

async function tvl(api) {
  const balances = await Promise.all(
    POOLS.map((target) => api.getBalance({ target }))
  );
  balances.forEach((bal) => api.addGasToken(bal));
}

module.exports = {
  methodology:
    'Sum of native MON held by the four MixyMon privacy pool contracts on Monad mainnet (200, 2,000, 20,000, and 200,000 MON fixed-denomination shielded pools).',
  // Earliest pool deploy: block 71,965,516 on Monad mainnet
  // (2026-05-02T14:46:32Z). Before this timestamp every pool balance is 0.
  start: 1777733192,
  timetravel: true,
  misrepresentedTokens: false,
  monad: {
    tvl,
  },
};
