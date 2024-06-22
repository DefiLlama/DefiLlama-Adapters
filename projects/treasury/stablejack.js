const TREASURY = '0xDC325ad34C762C19FaAB37d439fbf219715f9D58';
const wsAVAX = '0x7aa5c727270C7e1642af898E0EA5b85a094C17a1';

module.exports = treasuryExports({
  avalanche: {
    tokens: [ wsAVAX, ],
    owners: [ TREASURY,],
  },
});

// 1wsAVAX = 1AVAX (price)