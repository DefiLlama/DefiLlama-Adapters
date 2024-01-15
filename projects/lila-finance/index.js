/**
 * Lila Finance is a fixed rate lending protocol.
 * 
 * @see https://www.lila.finance
 *
 */

const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
    arbitrum: {
          tvl: sumTokensExport(
            { 
              owners: [
                  "0xd623D2a89d30dADf46E28CDE3b7De4C562ff6FA5", //usdc_aave_proxy
                  "0x40322ef429ea2d94c9769691B9C59f2A51271996", //dai_aave_proxy
                  "0xdCC1509e687a1dec30FE1145253aC0eD1eb3012D", //usdt_aave_proxy
                  "0x7abC7a5D653c7E04f9864780500FDc519768fbCb", //wbtc_aave_proxy
                  "0xD6827076A91ff31656a926241e6524eA4F25F3B5",  //weth_aave_proxy
                  "0x1dD03ff49FBfD824C8bd8f8cfbABe7898d727442", //usdc.e_aave_proxy
                  "0x5c2c8F52be40BfBB9f30AD3f409d135e27Cb9d93", //frax_aave_proxy
                ],
              tokens: [
                ADDRESSES.arbitrum.USDC_CIRCLE, // USDC
                "0x724dc807b04555b71ed48a6896b6F41593b8C637", // aUSDC 
                ADDRESSES.arbitrum.DAI,  // DAI
                "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE", // aDAI
                ADDRESSES.arbitrum.USDT, // USDT
                "0x6ab707Aca953eDAeFBc4fD23bA73294241490620", // aUSDT
                ADDRESSES.arbitrum.WBTC, // WBTC
                "0x078f358208685046a11C85e8ad32895DED33A249", // aWBTC
                ADDRESSES.arbitrum.WETH, // WETH
                "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8", // aETH
                ADDRESSES.arbitrum.USDC, // USDC.e
                "0x625E7708f30cA75bfd92586e17077590C60eb4cD", // aUSDC.e
                "0x17fc002b466eec40dae837fc4be5c67993ddbd6f", // FRAX
                "0x38d693cE1dF5AaDF7bC62595A37D667aD57922e5", // aFRAX
              ]}
          ),
    }
};
