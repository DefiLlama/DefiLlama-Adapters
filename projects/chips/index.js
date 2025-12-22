const { fetchLocal, mkMeta } = require("../helper/pact");

const contract = "n_e98a056e3e14203e6ec18fada427334b21b667d8.chips";
const chainId = "2";
const network = `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/${chainId}/pact`;
const GAS_PRICE = 0.00000001;
const creationTime = () => Math.floor(Date.now() / 1000) - 10;

async function fetch() {
  const { result } = await fetchLocal(
    {
      pactCode: `(use ${contract}) (get-tvl2)`,
      meta: mkMeta("", chainId, GAS_PRICE, 3000, creationTime(), 600),
    },
    network
  );

  const balances = result?.data || {};
  let kdaTotal = 0;

  for (const [key, value] of Object.entries(balances)) {
    if (key !== "coin") continue;
    const amount = value?.decimal || value;
    kdaTotal += parseFloat(amount || 0);
  }

  return {
    kadena: kdaTotal
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology:
    "TVL tracks the KDA-equivalent value of all locked cTokens and kWATT tokens using on-chain DEX pricing. The contract returns a single 'coin' value in KDA, excluding USD-only fields.",
  kadena: {
    tvl: fetch,
  },
};
