const { fetchLocal, mkMeta } = require("../helper/pact");

const contract = "n_e98a056e3e14203e6ec18fada427334b21b667d8.chips";
const chainId = "1";
const network = `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/${chainId}/pact`;
const GAS_PRICE = 0.00000001;
const creationTime = () => Math.floor(Date.now() / 1000) - 10;

async function fetch() {
  const { result } = await fetchLocal(
    {
      pactCode: `(use ${contract}) (get-tvl)`,
      meta: mkMeta("", chainId, GAS_PRICE, 3000, creationTime(), 600),
    },
    network
  );

  const balances = result?.data || {};
  const coinValue = balances.coin?.decimal || balances.coin;

  return {
    kadena: parseFloat(coinValue || 0)
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "TVL tracks the USD-equivalent value of all locked cTokens, kWATT tokens, and unclaimed rewards, converted into KDA using the current oracle rate. The resulting value is reported as KDA locked.",
  kadena: {
    tvl: fetch,
  },
};
