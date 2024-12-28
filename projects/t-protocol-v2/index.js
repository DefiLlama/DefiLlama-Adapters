const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const RUST_POOL = "0x38a1753AEd353e58c64a55a3f3c750E919915537";
const UNI_V3_MANAGER = "0x9C27F7BB05dDF33F3e1004eDC16f14d1402838Cc";
const STBT = '0x530824DA86689C9C17CdC2871Ff29B058345b44a'
const USTP = '0xed4d84225273c867d269f967cc696e0877068f8a'

module.exports = {
  methodology: "counts value of assets in the Treasury",
  start: '2023-03-04',
  ethereum: {
    tvl,
  },
};

async function tvl(api) {
  await api.sumTokens({ owner: RUST_POOL, tokens: [ADDRESSES.ethereum.USDC, STBT]})
  return sumTokens2({ owner: UNI_V3_MANAGER, resolveUniV3: true, blacklistedTokens: [USTP], api,  })
  
}