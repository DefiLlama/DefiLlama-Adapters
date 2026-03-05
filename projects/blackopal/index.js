const ADDRESSES = require('../helper/coreAssets.json');

const SHARES = "0x04E5a6f7eE9977D38f57945c31B72178c9Cf1c06";

async function tvl(api) {
  const [shareValueResult, totalSupply, decimals] = await Promise.all([
    api.call({
      target: SHARES,
      abi: 'function shareValue() view returns (uint256 value, uint256 timestamp)',
    }),
    api.call({ target: SHARES, abi: 'erc20:totalSupply' }),
    api.call({ target: ADDRESSES.plume_mainnet.USDC, abi: 'erc20:decimals' }),
  ]);

  const nav = BigInt(shareValueResult.value) * BigInt(totalSupply)
    / (10n ** BigInt(36 - Number(decimals)));
  api.add(ADDRESSES.plume_mainnet.USDC, nav.toString());
}

module.exports = {
  methodology: 'TVL is the Net Asset Value of the BlackOpal fund, computed as share value multiplied by total shares supply.',
  start: '2025-10-14',
  timetravel: false,
  doublecounted: true,
  plume_mainnet: { tvl },
};
