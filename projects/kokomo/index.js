const { compoundExports, } = require('../helper/compound')

module.exports = {
    hallmarks: [
        [1680264000,"Rug Pull"]
      ],
    optimism: compoundExports('0x91c471053bA4697B13d62De1E850Cc89EbE23633', 'optimism'),
    arbitrum: compoundExports('0x91c471053bA4697B13d62De1E850Cc89EbE23633', 'arbitrum'),
}
