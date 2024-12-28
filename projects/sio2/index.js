const { aaveExports, methodology, } = require("../helper/aave");

module.exports = {
  methodology,
  astar: aaveExports("astar", '0x9D8bB85b1c728f69672923dD4A0209EC8b75EFda', undefined, undefined, {
    abis: {
      getAllATokens: "function getAllSTokens() view returns (tuple(string symbol, address tokenAddress)[])"
    }
  })
}