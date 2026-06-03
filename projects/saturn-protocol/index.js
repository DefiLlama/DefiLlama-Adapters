const ADDRESSES = require('../helper/coreAssets.json')

const USDat = '0x23238f20b894f29041f48d88ee91131c395aaa71';
const sUSDat = '0xd166337499e176bbc38a1fbd113ab144e5bd2df7';
const M = '0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b';
const USDC = ADDRESSES.ethereum.USDC;
// Saturn STRC price oracle (same source used by the fees adapter); STRC balances are 6 decimals.
const STRC_ORACLE = '0x5f7eCD0D045c393da6cb6c933c671AC305A871BF';
const STRC_DECIMALS = 6;

async function tvl(api) {
  // USDat backing: tokenized treasuries (M0's $M) + USDC held by the USDat contract.
  await api.sumTokens({ owner: USDat, tokens: [M, USDC] });
  const [strcBalance, { price, priceDecimals }] = await Promise.all([
    api.call({ target: sUSDat, abi: 'uint256:strcBalance' }),
    api.call({ target: STRC_ORACLE, abi: 'function getPrice() view returns (uint256 price, uint8 priceDecimals)' }),
  ]);
  const strcPrice = Number(price) / 10 ** Number(priceDecimals);
  if (strcPrice > 0) {
    const strcUsd = (Number(strcBalance) / 10 ** STRC_DECIMALS) * strcPrice;
    api.addUSDValue(Math.round(strcUsd));
  }

  return api.getBalances();
}

module.exports = {
  methodology: "USDat backing (tokenized treasuries $M and USDC held by the USDat contract) plus the STRC digital-credit backing of sUSDat, valued via Saturn's STRC price oracle.",
  ethereum: {
    tvl,
  },
};
