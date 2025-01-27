const { sumTokens } = require("../helper/sumTokens");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js');

const owners = bitcoinAddressBook.coffernetwork;

async function tvlFromBitcoinL1(api) {
  return sumTokens({ owners, api })
}

module.exports = {
  methodology: "TVL is fetched from Coffer Network Bitcoin Staking Protocol from native Bitcoin and CoBTC's contracts from multi-evm-chains, which represents the total Bitcoin locked in the Coffer Network Bitcoin Staking Protocol.",
  start: "2025-01-20",
  bitcoin: {
    tvl: tvlFromBitcoinL1,
  },
};

// /**
//  * Fetches the total value locked (TVL) in the Coffer Network on EVM Networks, such as Bitcoin Layer 2
//  * by calling the totalSupply of each token contract provided.
//  *
//  * @param {Object} api - The API object used to interact with the TVL tracking system.
//  * @param {Array} tokens - An array of token contract addresses to query for total supply.
//  */
// async function tvlFromEvmL2(api, tokens) {
//   const balances = await api.multiCall({ abi: "uint256:totalSupply", calls: tokens })
//   api.add(tokens, balances)

//   console.log(api)
//   console.log(tokens, balances)
// }

// const config = {
//   bsc: {
//     tokens: [
//       "0x918b3aa73e2D42D96CF64CBdB16838985992dAbc",  // coBTC
//     ]
//   }
// }

// Object.keys(config).forEach(chain => {
//   const { tokens } = config[chain]

//   module.exports[chain] = {
//     tvl: (api) => tvlFromEvmL2(api, tokens)
//   }
// })
