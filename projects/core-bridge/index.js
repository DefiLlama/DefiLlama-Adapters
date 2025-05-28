const { sumTokens2 } = require("../helper/unwrapLPs");

const owners = ['0x52e75D318cFB31f9A2EdFa2DFee26B161255B233', '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2']
const owner = '0x29d096cD18C0dA7500295f082da73316d704031A'

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners,
        fetchCoValentTokens: true,
        permitFailure: true
      }),
  },
  bsc: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners,
        fetchCoValentTokens: true,
        permitFailure: true
      }),
  },
  polygon: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners,
        fetchCoValentTokens: true,
        permitFailure: true
      }),
  },
  optimism: {
    tvl: (api) =>
      sumTokens2({
        api,
        owner,
        fetchCoValentTokens: true,
        permitFailure: true
      }),
  },
  avax: {
    tvl: (api) =>
      sumTokens2({
        api,
        owner,
        fetchCoValentTokens: true,
        permitFailure: true
      }),
  },
  arbitrum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owner,
        fetchCoValentTokens: true,
        permitFailure: true
      }),
  },
  base: {
    tvl: (api) =>
      sumTokens2({
        api,
        owner: '0x84FB2086Fed7b3c9b3a4Bc559f60fFaA91507879',
        fetchCoValentTokens: true,
        permitFailure: true
      }),
  },
};
