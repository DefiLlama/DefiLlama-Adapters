const sdk = require("@defillama/sdk");
const { getChainTransform } = require("../helper/portedTokens");
const axios = require("axios");
const apiUrl = "https://goodghosting-api.com/v1/games";

const chainIdMap = {
  ethereum: 1,
  polygon: 137,
  celo: 42220,
};

function tvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const gameData = await axios.get(apiUrl).then((resp) => resp.data);

    const balances = {};
    const transform = await getChainTransform(chain);

    const calls = Object.values(gameData)
      .filter((game) => game.networkId == chainIdMap[chain])
      .map((game) => [
        {
          target: game.depositTokenAddress,
          params: [game.id],
        },
        {
          target: game.liquidityTokenAddress,
          params: [game.id],
        },
      ])
      .flat();

    const gameContractBalances = await sdk.api.abi.multiCall({
      calls,
      abi: "erc20:balanceOf",
      chain,
    });

    sdk.util.sumMultiBalanceOf(balances, gameContractBalances, true, transform);

    //fix decimal issue with celo tokens
    for (const representation of ["celo-dollar", "celo", "celo-euro"]) {
      if (balances[representation] !== undefined) {
        balances[representation] = Number(balances[representation]) / 1e18;
      }
    }

    return balances;
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "counts the amount of interest bearing tokens owned by the smart game contract",
  polygon: {
    tvl: tvl("polygon"),
  },
  celo: {
    tvl: tvl("celo"),
  },
}
