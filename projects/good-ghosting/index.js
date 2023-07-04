const sdk = require("@defillama/sdk");
const { getChainTransform } = require("../helper/portedTokens");
const { getConfig } = require("../helper/cache");

const apiUrl = "https://goodghosting-api.com/v1/games";

const chainIdMap = {
  ethereum: 1,
  polygon: 137,
  celo: 42220,
};

const contractVersions = {
  v200: ["2.0.0", "2.0.1", "2.0.2", "2.0.3", "2.0.4", "2.0.5"],
  v001: "0.0.1",
  v002: "0.0.2",
  v003: "0.0.3",
};

const isV2Game = (contractVersion) => {
  if (contractVersions.v200.includes(contractVersion)) {
    return true;
  }
  const [derivedContractVersion] = contractVersion.split("-");
  if (contractVersions.v200.includes(derivedContractVersion)) {
    return true;
  }
  return false;
};

function tvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const gameData = await getConfig("good-ghosting", apiUrl);

    const balances = {};
    const transform = await getChainTransform(chain);

    const calls = Object.values(gameData)
      .filter((game) => game.networkId == chainIdMap[chain])
      .map((game) => {
        const gameParams = [
          {
            target: game.depositTokenAddress,
            params: [game.id],
          },
          {
            target: game.liquidityTokenAddress,
            params: [game.id],
          },
        ];

        if (isV2Game(game.contractVersion)) {
          gameParams.push({
            target: game.depositTokenAddress,
            params: [game.strategyController.toLowerCase()],
          });

          gameParams.push({
            target: game.liquidityTokenAddress,
            params: [game.strategyController.toLowerCase()],
          });
        }
        return gameParams;
      })
      .flat();

    const gameContractBalances = await sdk.api.abi.multiCall({
      calls: calls.filter(i => i.target),
      abi: "erc20:balanceOf",
      chain,
      permitFailure: true,
    });

    sdk.util.sumMultiBalanceOf(
      balances,
      gameContractBalances,
      false,
      transform
    );

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
};
