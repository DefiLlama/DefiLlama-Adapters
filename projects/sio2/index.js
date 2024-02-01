const { aaveExports } = require("../helper/aave");

module.exports = {
  timetravel: true,
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.`,
  astar: aaveExports("astar", '0x9D8bB85b1c728f69672923dD4A0209EC8b75EFda', undefined, undefined, {
    abis: {
      getAllATokens: "function getAllSTokens() view returns (tuple(string symbol, address tokenAddress)[])"
    }
  })
}