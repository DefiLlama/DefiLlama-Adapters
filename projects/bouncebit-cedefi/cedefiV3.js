const ADDRESSES = require('../helper/coreAssets.json');

const config = {
  ethereum: { gateway: '0x2Fa09B8E0e1D83e558E7BD65d6F4205A48B99D59' },
};

const GET_ALL_SUPPORTED_TOKENS_ABI = 'function getAllSupportedTokens() view returns (address[])';

async function cedefiV3Tvl (api) {
  const cfg = config[api.chain];
  if (!cfg) return api.getBalances();

  const supported = await api.call({ abi: GET_ALL_SUPPORTED_TOKENS_ABI, target: cfg.gateway });

  const tokens = supported.map(t => t.toLowerCase() === ADDRESSES.GAS_TOKEN_2.toLowerCase() ? ADDRESSES.null : t);
  await api.sumTokens({ owner: cfg.gateway, tokens });

  return api.getBalances();
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: cedefiV3Tvl
  };
});
