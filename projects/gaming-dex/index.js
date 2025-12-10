const { onChainTvl } = require('../helper/balancer')

module.exports = {
  // defiverse: { tvl: onChainTvl('0x2FA699664752B34E90A414A42D62D7A8b2702B85', 87620) },
  defiverse: { tvl: () => ({  })},
  oas: { tvl: onChainTvl('0xfb6f8FEdE0Cb63674Ab964affB93D65a4a7D55eA', 4522800) }
};
