const ADDRESSES = require('../helper/coreAssets.json')

const USDat = '0x23238f20b894f29041f48d88ee91131c395aaa71';
const sUSDat = '0xd166337499e176bbc38a1fbd113ab144e5bd2df7';
// Saturn migrated USDat's reserve from M0's $M to PYUSDx (MoonPay/M0 PYUSD-backed
// extension) in Aug 2026; the $M balance is now 0.
const PYUSDx = '0xebdb0942ce16386ab90718c7bd10c91cdb66b14d';
const USDC = ADDRESSES.ethereum.USDC;
// sUSDat is backed by STRC (Strategy's "Stretch" preferred stock); balances are 6 decimals.
const STRC_DECIMALS = 6;

async function tvl(api) {
  // USDat backing: PYUSDx reserve + USDC held by the USDat contract.
  await api.sumTokens({ owner: USDat, tokens: [PYUSDx, USDC] });
  // STRC has no on-chain token to price, so value the sUSDat backing via DefiLlama's
  // tradfi STRC feed (coingecko:llama-stock-strc) rather than Saturn's own oracle.
  const strcBalance = await api.call({ target: sUSDat, abi: 'uint256:strcBalance' });
  api.addCGToken('llama-stock-strc', Number(strcBalance) / 10 ** STRC_DECIMALS);

  return api.getBalances();
}

module.exports = {
  methodology: "USDat backing (the PYUSDx reserve and USDC held by the USDat contract) plus the STRC digital-credit backing of sUSDat, priced via DefiLlama's tradfi STRC feed (NASDAQ: STRC).",
  ethereum: {
    tvl,
  },
};
