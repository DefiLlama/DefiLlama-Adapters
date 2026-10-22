// wstDIEM — Base
// wstDIEM is an ERC-4626 vault over DIEM, Venice.ai's inference-credit token. Deposited DIEM is staked
// on Venice by the vault itself (DIEM.stake), and the daily inference credit it earns is sold for
// USDC and compounded back into the vault, raising the wstDIEM share price.
//
// TVL is the vault's totalAssets(): idle DIEM + DIEM staked on Venice + DIEM in unstake cooldown.
// Staked DIEM leaves the vault's balanceOf (it moves into DIEM's internal stakedInfos), so a token
// balance read would show ~0 — totalAssets() is the authoritative figure.
const VAULT = '0xe49FA849cB37b0e7A42B2335e333fb99474167ba'; // wstDIEM (InferenceVault v6)
const DIEM = '0xF4d97F2da56e8c3098f3a8D538DB630A2606a024';

async function tvl(api) {
  const assets = await api.call({ target: VAULT, abi: 'uint256:totalAssets' });
  api.add(DIEM, assets);
}

module.exports = {
  methodology:
    'TVL is the DIEM held by the wstDIEM vault, read from totalAssets(): idle DIEM plus DIEM the vault ' +
    'has staked on Venice and DIEM in unstake cooldown. Yield is Venice inference credit sold for USDC ' +
    'and compounded into the vault as DIEM, so it shows up as share-price growth, not new TVL tokens.',
  start: '2026-06-10',
  base: { tvl },
};
