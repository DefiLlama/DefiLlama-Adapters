const config = {
  arbitrum: [
    '0x57C10bd3fdB2849384dDe954f63d37DfAD9d7d70', // tUSDC
  ]
};

const tvl = async (api) => {
  return api.erc4626Sum({ calls: config[api.chain], tokenAbi: 'asset', balanceAbi: 'totalAssets' })
}

module.exports = {
  methodology: "TVL displays the total amount of assets stored in the Thesauros contracts.",
  start: '2025-09-19',
  hallmarks: [[1758283200, "Protocol launch"]],
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});