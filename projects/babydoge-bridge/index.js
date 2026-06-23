const { sumTokens } = require("../helper/chain/ton");
const { sumTokensExport } = require("../helper/unwrapLPs");
const { sumTokens2 } = require("../helper/solana");

const BSC_TOKEN = "0xc748673057861a797275CD8A068AbB95A902e8de"; // BabyDoge

const BSC_BASE_BRIDGE = "0x9F0d4f965F8d7503046093F1BdA6052eFE6948b8";
const BSC_TON_BRIDGE = "0x1d09d3458Cc150016F0Fd7B079aF41E17Ce65909";
const BSC_SOL_BRIDGE = "0xac65072FC013442E14CCe3C8dc47e10dEe3E0683";

const BASE_BRIDGE = "0x7d77aC40BF16fF72DF9f48266F8e115aA1Bc30F7";
const BASE_TOKEN = "0x58ecEF26335Af7b04A998105a6603B0Dc475aF33"; // BabyDoge

const TON_BRIDGE = "EQDTqThEGo8R-3LWf9IPK5eBhPFtnk7FuwmXaqLDnSoKJ1vw";
const TON_TOKEN = "EQCWDj49HFInSwSk49eAo476E1YBywLoFuSZ6OO3x7jmP2jn"; // BabyDoge jetton

const SOLANA_BRIDGE_VAULT = "4bhMeAzoU3EenGxKXTo7nWjKVNqg1YTrN6rHLCasyvxs";
const SOLANA_TOKEN = "7dUKUopcNWW6CcU4eRxCHh1uiMh32zDrmGf6ufqhxann"; // BabyDoge

async function baseTvl(api) {
  const vault = await api.call({ abi: "address:vault", target: BASE_BRIDGE });
  const balance = await api.call({ abi: "erc20:balanceOf", target: BASE_TOKEN, params: [vault] });
  // Map to BSC token for pricing (same token, different chain)
  api.add(`bsc:${BSC_TOKEN}`, balance, { skipChain: true });
}

module.exports = {
  methodology: "Tracks BabyDoge tokens locked in bridge contracts",
  bsc: {
    tvl: sumTokensExport({ owners: [BSC_BASE_BRIDGE, BSC_TON_BRIDGE, BSC_SOL_BRIDGE], tokens: [BSC_TOKEN] }),
  },
  base: {
    tvl: baseTvl,
  },
  ton: {
    tvl: async (api) => {
      await sumTokens({
        api,
        owners: [TON_BRIDGE],
        tokens: [TON_TOKEN],
      });
      return api.getBalances();
    },
  },
  solana: {
    tvl: async (api) => sumTokens2({
      api,
      tokensAndOwners: [[SOLANA_TOKEN, SOLANA_BRIDGE_VAULT]]
    }),
  },
};
