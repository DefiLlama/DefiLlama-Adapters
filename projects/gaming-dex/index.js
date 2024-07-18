const { onChainTvl } = require('../helper/balancer')

module.exports = {
  defiverse: {
    tvl: onChainTvl('0x2FA699664752B34E90A414A42D62D7A8b2702B85', 87620),
  },
};
