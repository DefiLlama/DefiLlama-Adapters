const { usdCompoundExports } = require("../helper/compound");

const blacklist = [
  '0x4002a65e13f87C897B8018Fd7329af17339346ba',
  '0x1611Ac5e87aC082e016d60dB63eccb50F45B8b4e',
  '0x438DDA002CaDBe95F72b7b9acB1FEf4782418566',
];
  
module.exports = {
    incentivized: true,
    misrepresentedTokens: true,
    methodology: `As in Compound Finance, TVL counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are counted as "Borrowed" TVL and can be toggled towards the regular TVL.`,
    ethpow: usdCompoundExports("0x5e496e7F241B13c514A78B7E840bc3cC744D7215", "ethpow", "0xb9e008f2C039fB994C8adD806F8aF709899aA95e", undefined , {blacklist})
} 