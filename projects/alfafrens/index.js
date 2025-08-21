const ADDRESSES = require('../helper/coreAssets.json')
/**
 * Alfafrens SoFi - a project by Superfluid.
 * alfafrens.com
 *
 * This adapter tracks amount flowing between subscribers and channels. Currently it only tracks the
 * version 2 contracts.
 *
 * V1 Creation
 * - Stream token: $DEGENx
 * V2 Creation https://basescan.org/tx/0x6c39ce34ab8349b1b57deb1ca5228e8a57e19699cde082a7da57f0e03984149b
 * - Stream token: $ETHx [0x46fd5cfb4c12d87acd3a13e92baa53240c661d93]
 * - Reward token: $AF   [0x6c90a582c166f59de91f97fa7aef7315a968b342]
 */

const { graphQuery } = require("../helper/http");

const tokens = {
  ETHx: {
    symbol: "ETHx",
    address: "0x46fd5cfb4c12d87acd3a13e92baa53240c661d93",
    underlying_symbol: "ETH",
    underlying_address: ADDRESSES.null,
  },
};

const alfafrensGraphURL =
  "https://api.goldsky.com/api/public/project_clsnd6xsoma5j012qepvucfpp/subgraphs/alfafrens_v2_no_prune/2.0.0/gn";

const tvl = async (api) => {
  let hasData = true;
  let pageSize = 1000,
    pageSkip = 0;

  while (hasData) {
    const { userAddresses } = await getUserWalletAddresses(
      api,
      pageSize,
      pageSkip
    );

    await getUserBalancesOnChain(api, tokens.ETHx, userAddresses);


    pageSkip = pageSkip + pageSize;
    hasData = userAddresses.length === pageSize
  }
}

module.exports = {
  methodology: "Total ETH streamed on the platform",
  doublecounted: true,
  base: { tvl },
  hallmarks: [[1734000000, "Alfafrens V2 Launch"]],
};

/**
 * Returns a list of addresses
 * @param {*} api
 * @param {int} pageSize
 * @param {int} pageSkip
 * @returns {string[]}
 */
const getUserWalletAddresses = async (api, pageSize = 500, pageSkip = 0) => {
  const getWalletBatchQuery = `query getAAUsers($skip: Int = 0, $first: Int = 1000, $block: Block_height) {
  users(
    orderBy: createdTimestamp
    orderDirection: asc
    first: $first
    skip: $skip
    block: $block
  ) {
    id
    createdTimestamp
  }
}`;

  const { users } = await graphQuery(
    alfafrensGraphURL,
    getWalletBatchQuery,
    {
      skip: pageSkip,
      first: pageSize,
    },
    { api }
  );

  return { userAddresses: users.map((u) => u.id), pageSize, pageSkip };
};

/**
 * Returns the total tokens for a list of addresses
 * @param {*} api
 * @param {{symbol:string, address:string, underlying_symbol:string|null, underlying_address:string|null}} token
 * @param {string[]} addresses
 * @returns {int}
 */
const getUserBalancesOnChain = async (api, token, addresses) => {
  const uToken = token.underlying_address || token.address
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: addresses, target: token.address })
  api.add(uToken, bals)
};
