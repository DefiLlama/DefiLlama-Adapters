const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require("../helper/cache");

const apiUrl = "https://goodghosting-api.com/v1/games";

const chainIdMap = {
  ethereum: 1,
  polygon: 137,
  celo: 42220,
  base: 8453,
};

const contractVersions = {
  v200: ["2.0"],
  v001: "0.0.1",
  v002: "0.0.2",
  v003: "0.0.3",
};

const isV2Game = (contractVersion) => {
   const baseContractVersion = contractVersion.slice(0, 3);

   if (contractVersions.v200.indexOf(baseContractVersion) !== -1) {
     return true;
   }
   return false;
}

async function tvl(api) {
  const gameData = await getConfig("good-ghosting", apiUrl)
  const ownerTokens = []
  Object.values(gameData)
      .filter((game) => game.networkId == chainIdMap[api.chain])
      .map((game) => {
        const tokens = [game.depositTokenAddress, game.liquidityTokenAddress, game.gaugeLiquidityTokenAddress].filter(i => i)
        ownerTokens.push([tokens, game.id])

        if (isV2Game(game.contractVersion))
          ownerTokens.push([tokens, game.strategyController])
      })
  return sumTokens2({ api, ownerTokens})
}

module.exports = {
  methodology: "counts the amount of interest bearing tokens owned by the smart game contract",
  polygon: { tvl },
  celo: { tvl },
  base: {tvl}
};
