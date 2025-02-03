const { sumTokens } = require("../helper/sumTokens.js");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js');

/**
 * Fetches the total value locked (TVL) in the Coffer Network on Bitcoin,
 * by summing the balance of all addresses in the Coffer Network Bitcoin Staking Protocol.
 *
 * @param {Object} api - The API object used to interact with the TVL tracking system.
 * @returns {Promise<BigNumber>} The total value locked in the protocol.
 */
async function tvlFromBtc(api) {
  const owners = await bitcoinAddressBook.coffernetwork();
  return sumTokens({ owners, api })
}

module.exports = {
  methodology: "TVL is fetched from Coffer Network Bitcoin Staking Protocol from native Bitcoin",
  start: "2025-01-20",
  isHeavyProtocol: true,
  doublecounted: true,
  bitcoin: {
    tvl: tvlFromBtc,
  },
}

/**
 * Fetches the total value locked (TVL) in the Coffer Network on EVM Networks, such as Bitcoin Layer 2
 * by calling the totalSupply of each token contract provided.
 *
 * @param {Object} api - The API object used to interact with the TVL tracking system.
 * @param {Array} tokens - An array of token contract addresses to query for total supply.
 */
async function tvlFromEvm(api, tokens) {
  const balances = await api.multiCall({ abi: "uint256:totalSupply", calls: tokens })

  // console.log(api)
  // console.log(tokens, balances)

  api.add(tokens, balances)
}

// all support chains and token addresses
const config = {
  bsc: {
    tokens: [
      "0x918b3aa73e2D42D96CF64CBdB16838985992dAbc",  // wrapped coBTC on bsc
    ]
  }
}

// fetch TVL for each chain
Object.keys(config).forEach(chain => {
  const { tokens } = config[chain]

  module.exports[chain] = {
    tvl: (api) => tvlFromEvm(api, tokens)
  }
})
