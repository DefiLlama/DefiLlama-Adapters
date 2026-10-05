const ADDRESSES = require('../helper/coreAssets.json')

const USDat = '0x23238f20b894f29041f48d88ee91131c395aaa71';
const sUSDat = '0xd166337499e176bbc38a1fbd113ab144e5bd2df7';
// Saturn migrated USDat's reserve from M0's $M to PYUSDx (MoonPay/M0 PYUSD-backed
// extension) on 2026-08-19; $M is 0 now but non-zero at earlier blocks, so both are
// summed to keep historical TVL correct.
const M = '0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b';
const PYUSDx = '0xebdb0942ce16386ab90718c7bd10c91cdb66b14d';
const USDC = ADDRESSES.ethereum.USDC;
// sUSDat is backed by STRC (Strategy's "Stretch" preferred stock); balances are 6 decimals.
const STRC_DECIMALS = 6;
// sUSDat v2 upgrade (2026-09-30): strcBalance() was removed and STRC accounting moved to
// modules: the STRC mirror module and the STRCon module
const V2_UPGRADE_BLOCK = 26091045;

async function tvl(api) {
  // USDat backing: reserve tokens ($M pre-migration, PYUSDx after) + USDC held by the USDat contract.
  await api.sumTokens({ owner: USDat, tokens: [PYUSDx, M, USDC] });

  let strcBalance;
  if (await api.getBlock() < V2_UPGRADE_BLOCK) {
    strcBalance = await api.call({ target: sUSDat, abi: 'uint256:strcBalance' });
  } else {
    const [mirror, strcon] = await Promise.all([
      api.call({ target: sUSDat, abi: 'address:strcMirrorModule' }),
      api.call({ target: sUSDat, abi: 'address:strconModule' }),
    ]);
    strcBalance = await api.call({ target: mirror, abi: 'uint256:balance' });
    const strconToken = await api.call({ target: strcon, abi: 'address:ASSET' });
    await api.sumTokens({ owners: [sUSDat, strcon], tokens: [strconToken] });
  }
  // Mirrored STRC has no on-chain token to price, so value it via DefiLlama's
  // tradfi STRC feed (coingecko:llama-stock-strc) rather than Saturn's own oracle.
  api.addCGToken('llama-stock-strc', Number(strcBalance) / 10 ** STRC_DECIMALS);

  return api.getBalances();
}

module.exports = {
  methodology: "USDat backing (the PYUSDx reserve, legacy $M, and USDC held by the USDat contract) plus the STRC digital-credit backing of sUSDat, priced via DefiLlama's tradfi STRC feed (NASDAQ: STRC).",
  ethereum: {
    tvl,
  },
};
