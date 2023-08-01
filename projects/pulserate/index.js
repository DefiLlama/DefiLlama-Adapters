const { getUniTVL, sumTokensExport } = require("../helper/unknownTokens");
const PSHARE = "0x11D4109Cd7E5cE596471583E90e20e51d087de33";
module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xE2332E5297b18a21DcE0E6ac461e821C353A00cA) is used to find the LP pairs. TVL is equal to the liquidity on the AMM. Staking balance is equal to the balance of PSHARE in Boardroom contract",
  pulse: {
    tvl: getUniTVL({
      factory: "0xE2332E5297b18a21DcE0E6ac461e821C353A00cA",
      useDefaultCoreAssets: true,
      fetchBalances: true,
    }),
    staking: sumTokensExport({
      owners: ["0xD7A2F5A72079654E7997C615cC07A1b92D850b32"],
      tokens: [PSHARE],
      lps: [
        '0x91d3E933B7f2ccBAdf4d5278d826Cb10659a1c55',
      ],
      useDefaultCoreAssets: true,
    }),
  },
};
