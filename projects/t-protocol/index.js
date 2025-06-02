const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const USDC_TOKEN_CONTRACT = ADDRESSES.ethereum.USDC;
const TREASURY_CONTRACT = "0xa01D9bc8343016C7DDD39852e49890a8361B2884";
const STBT = '0x530824DA86689C9C17CdC2871Ff29B058345b44a'

module.exports = {
  methodology: "counts value of assets in the Treasury",
  start: '2023-03-04',
  ethereum: {
    tvl: sumTokensExport({ owner: TREASURY_CONTRACT, tokens: [USDC_TOKEN_CONTRACT, STBT] }),
  },
};
