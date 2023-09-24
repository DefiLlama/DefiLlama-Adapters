const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const USDC_TOKEN_CONTRACT = ADDRESSES.ethereum.USDC;
const STBT = "0x530824DA86689C9C17CdC2871Ff29B058345b44a";
const USTP = "0xed4d84225273c867d269F967CC696e0877068f8a";

const V1_TREASURY_CONTRACT = "0xa01D9bc8343016C7DDD39852e49890a8361B2884";
const V2_RUSTPOOL_CONTRACT = "0x38a1753AEd353e58c64a55a3f3c750E919915537";
const UNISWAP_V3_USTP_USDC_POOL_CONTRACT =
  "0x15EFa9e8ffd147f8de6639b06DbECbD433789B39";

module.exports = {
  methodology:
    "counts value of assets in the V1 Treasury, V2 Rustpool, and Uniswap V3 USTP-USDC pool",
  start: 1677913260,
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        V1_TREASURY_CONTRACT,
        V2_RUSTPOOL_CONTRACT,
        UNISWAP_V3_USTP_USDC_POOL_CONTRACT,
      ],
      tokens: [USDC_TOKEN_CONTRACT, STBT, USTP],
    }),
  },
};
