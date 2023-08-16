const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const coreRewards = "0xF32c5c83e19640ad414dC5922C0F9182F4695D69";
const plsRewards = "0xD7ba719d28079253e96b57A6518C41eeA2Be048d";
const IMPLS = "0x5f63BC3d5bd234946f18d24e98C324f629D9d60e";

const vaults = [
  //PulseX DAI/PLS
  "0xb098D878471c451Ccb521E391f7C98bD4709bfe9",

  //PulseX PLSX/PLS
  "0x97248ba432ED71FC933374884BcF8Ac0C42b5Df9",

  //PulseX HEX/PLS
  "0x9A563280F4Cc938e426ec220a2659cF7AE125ab6",

  //Daytona TONI/PLS
  "0x3ed45e98b9358E9cd39f06726F382eA1155656f5",

];

/*** Staking of native token IMPLS and IMPLS/PLS LP TVL Portion ***/
const staking = async (timestamp, ethBlock, chainBlocks, { api }) => {
  const staking_lpToken = 
    await api.call({
      abi: abi.stakingToken,
      target: coreRewards,
    })
  return sumTokens2({ api, tokens: [IMPLS, staking_lpToken], owners: [coreRewards, plsRewards]})
};


/*** vaults TVL portion ***/
const plsTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const lpTokens = (
    await sdk.api.abi.multiCall({
      abi: abi.LPtoken,
      calls: vaults.map((vault) => ({
        target: vault,
      })),
      chain: "pulse",
      block: chainBlocks["pulse"],
    })
  ).output.map((lp) => lp.output);

  const lpTokens_bal = (
    await sdk.api.abi.multiCall({
      abi: abi.balanceLPinSystem,
      calls: vaults.map((vault) => ({
        target: vault,
      })),
      chain: "pulse",
      block: chainBlocks["pulse"],
    })
  ).output.map((lpb) => lpb.output);

  for (let index = 0; index < vaults.length; index++) {
    sdk.util.sumSingleBalance(balances,lpTokens[index],lpTokens_bal[index], 'pulse')
  }

  return balances;
};

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  pulse:{
    tvl: plsTvl,
    staking
  },
  methodology: `The TVL is made up of the core rewards yield farm and LP deposits in our auto compounding vault strategies.`,
};
