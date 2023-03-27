const { compoundExports, } = require('../helper/compound')

module.exports = {
    optimism: compoundExports('0x91c471053bA4697B13d62De1E850Cc89EbE23633', 'optimism'),
    arbitrum: compoundExports('0x91c471053bA4697B13d62De1E850Cc89EbE23633', 'arbitrum'),
}
