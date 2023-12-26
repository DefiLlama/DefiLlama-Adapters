const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const v2Address = '0xc7ec02AEeCdC9087bf848c4C4f790Ed74A93F2AF';
const v202Address = '0xAdBAeE9665C101413EbFF07e20520bdB67C71AB6';

const WETH_CONTRACT = ADDRESSES.arbitrum.WETH;
const USDC_CONTRACT = ADDRESSES.arbitrum.USDC;

module.exports = {
  methodology: "USDC and WETH locked on predy contracts",
  arbitrum: {
      tvl: sumTokensExport({ owners: [v202Address, v2Address], tokens: [USDC_CONTRACT, WETH_CONTRACT,] }),
  },
  hallmarks: [
      [1671092333, "Launch Predy V3"],
      [1678734774, "Launch Predy V3.2"]
  ],
};
