const { sumTokensExport } = require('../helper/unwrapLPs')
const PHALA_TOKEN_CONTRACT = '0x6c5bA91642F10282b576d91922Ae6448C9d52f4E';
const SYGMA_ERC20_HANDLER = '0xC832588193cd5ED2185daDA4A531e0B26eC5B830';

module.exports = {
  methodology: 'Counts the number of PHALA tokens held by the Sygma ERC-20 Handler.',
  ethereum: {
    tvl: sumTokensExport({ owner: SYGMA_ERC20_HANDLER, tokens: [PHALA_TOKEN_CONTRACT] }),
  }
}