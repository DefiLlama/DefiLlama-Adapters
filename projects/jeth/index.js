const { sumTokensExport, nullAddress } = require('./helper/unwrapLPs');
const treasury = '0x7e90Ef7D172843dB68e42FC5fAA8CB7C1803Dcfa';

module.exports = {
  methodology: 'Total amount of ETH locked in Ethereum network 0x7e90Ef7D172843dB68e42FC5fAA8CB7C1803Dcfa.',
  ethereum: {
    tvl: sumTokensExport({ tokens: [nullAddress], owners: [treasury], })
  }
};
