const { timetravel } = require("../deliswap");

const VAULT = '0x79A86A652B6DeC1E7F5727C9aA1C02E1C8Af6E78';
const COLLATERALS = [
  '0xb88339CB7199b77E23DB6E890353E22632Ba630f',
  '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',
  '0x5555555555555555555555555555555555555555',
  '0xfD739d4e423301CE9385c1fb8850539D657C296D',
];

async function tvl(api) {
  const bals = await api.multiCall({
    abi: 'function totalCollateral(address token) view returns (uint256)',
    calls: COLLATERALS.map(token => ({ target: VAULT, params: [token] })),
  });
  api.addTokens(COLLATERALS, bals);
}

module.exports = {
  methodology:
    'TVL is user collateral (USDC, USDT, WHYPE, kHYPE) deposited into Delpho, read via the vault\'s totalCollateral view which aggregates buffer, allocated, and executor-deployed amounts across HyperLend and Morpho. USDV (minted debt) and sUSDV (staked USDV) are excluded to avoid double-counting.',
  start: 1783010460,
  timetravel: true,
  hyperliquid: { tvl },
};