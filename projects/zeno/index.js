const ADDRESSES = require('../helper/coreAssets.json')
async function metisTvl(api) {
  const vaultStorageAddress = "0xFaEee486F4A53cdBEaBE37216bcf1016eB4E52D6";

  // eth, usdt, usdc
  const zenoUnderlyingTokens = [
    ADDRESSES.metis.WETH,
    ADDRESSES.metis.m_USDC,
    ADDRESSES.metis.m_USDT,
  ];

  return api.sumTokens({
    owner: vaultStorageAddress,
    tokens: zenoUnderlyingTokens,
  });
}

module.exports = {
  start: '2024-03-13',
  metis: {
    tvl: metisTvl,
  },
};
