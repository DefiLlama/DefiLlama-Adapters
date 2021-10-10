const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const API_URL = "https://backend.mochi.fi/vaults?chainId=1";

const ethTvl = async () => {
  const balances = {};

  const contractAddresses = (await utils.fetchURL(API_URL)).data.vaults.map(
    (addr) => ({
      vault: addr.vaultAddress,
      stakedToken: addr.tokenAddress,
    })
  );

  for (const addr of contractAddresses) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [[addr.stakedToken, false]],
      [addr.vault]
    );
  }

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
  methodology: `We count TVL from all the Vaults through their contracts`,
};
