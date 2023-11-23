const sdk = require("@defillama/sdk");
const { sumTokensExport } = require("../helper/unwrapLPs");

const USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
const USDX = '0xEE43369197F78CFDF0D8fc48D296964C50AC7B57'
const liquidityPool = '0x20F6c269ACe844120de7AB84EeaD8359688670Bc'
const USDT = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
const USDCe = '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'
const DAI = '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'

module.exports = {

  arbitrum: {
        //tvl: arbiTvl,
        tvl: sumTokensExport({
          owner: USDX,
          tokens: [ USDC, USDT, USDCe, DAI ],
        }),
  },
  methodology: `The TVL of SubstanceX is equal to the total value of underlying assets locked in the USDX contract.`,
};
