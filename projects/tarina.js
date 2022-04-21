const { calculateUsdUniTvl } = require('./helper/getUsdUniTvl');

module.exports = {
  misrepresentedTokens: true,
  doublecounted: false,
  timetravel: true,
  incentivized: true,
  methodology: 'The Tarina subgraph and the Tarina factory contract address are used to obtain the balance held in every LP pair.',
  avalanche:{
      tvl: calculateUsdUniTvl(
          "0xb334a709dd2146caced08e698c05d4d22e2ac046",
          "avax",
          "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
          [
          "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", //USDC
          "0xc7198437980c041c805a1edcba50c1ce5db95118", //usdte
          "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664", //usdce
          ],
          "wrapped-avax"
      )
  }
}