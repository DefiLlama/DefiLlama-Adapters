const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");
const { stakings } = require("../helper/staking");
const { sumTokens2 } = require("../helper/unwrapLPs");
const REGISTRY_TOKENS = require("./ethMainnetRegistryTokens.js");
const GAUGE_TOKENS = require("./gaugeTokens.js");
const BEEFY_TOKENS = require("./beefyTokens.js");
const { YT_TOKENS, PT_TOKENS, SY_TOKENS } = require("./pendleTokens.js");
const { ethers } = require("ethers");

const OWNER = "0x2ea81946fF675d5Eb88192144ffc1418fA442E28";

const tvlTokens = [...REGISTRY_TOKENS, ...PT_TOKENS, ...SY_TOKENS];
const stakingTokens = [...GAUGE_TOKENS, ...YT_TOKENS];

const beefyTokenBalances = async () => {
  const fetchBeefyVaults = await utils.fetchURL(
    "https://api.beefy.finance/vaults"
  );
  const fetchBeefyTvlData = await utils.fetchURL(
    "https://api.beefy.finance/tvl"
  );
  const beefyVaults = fetchBeefyVaults.data;
  const beefyTvlData = fetchBeefyTvlData.data;

  const promises = BEEFY_TOKENS.map(async (tokenAddress) => {
    const beefyVault = beefyVaults.find(({ earnedTokenAddress }) => {
      return (
        earnedTokenAddress?.toString().toLowerCase() ===
        tokenAddress.toLowerCase()
      );
    });

    if (!beefyVault) return Promise.resolve(0);
    const { id } = beefyVault;
    const balance = sdk.api.erc20
      .balanceOf({
        target: tokenAddress,
        owner: OWNER,
        chain: "ethereum",
      })
      .then((response) => {
        return response.output;
      });

    const totalSupply = sdk.api.erc20
      .totalSupply({
        target: tokenAddress,
        chain: "ethereum",
      })
      .then((response) => {
        const formattedSupply = Number(ethers.formatUnits(response.output, 18));
        return formattedSupply;
      });

    const tvl = beefyTvlData[1][id];
    if (!totalSupply || !tvl) return Promise.resolve(0);

    const [balance_1, totalSupply_1, tvl_1] = await Promise.all([
      balance,
      totalSupply,
      tvl,
    ]);
    return { tokenAddress, tokenBalance: (tvl_1 / totalSupply_1) * balance_1 };
  });

  const balances = {};

  await Promise.all(promises)
    .then((results) => {
      results.forEach(({ tokenAddress, tokenBalance }) => {
        if (tokenBalance === undefined || isNaN(tokenBalance)) return;
        sdk.util.sumSingleBalance(
          balances,
          tokenAddress,
          tokenBalance,
          "ethereum"
        );
      });
    })
    .catch((error) => {
      console.error(error);
    });

  return balances;
};

module.exports = {
  ethereum: {
    tvl: async (_, _1, _2, { api }) => {
      return sumTokens2({
        owner: OWNER,
        tokens: tvlTokens,
        api,
        resolveLP: true,
      });
    },
    staking: async (_, _1, _2, { chain, block }) => {
      const getStakings = stakings(
        stakingTokens.map((tokenInfo) => tokenInfo.erc20TokenAddress),
        stakingTokens.map((tokenInfo) => tokenInfo.underlyingErc20TokenAddress)
      );

      const stakingBalances = await getStakings(_, _1, _2, {
        chain,
        block,
      });
      const beefyStakings = await beefyTokenBalances();
      return { ...stakingBalances, ...beefyStakings };
    },
  },
};
