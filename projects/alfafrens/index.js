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

const sdk = require("@defillama/sdk");

const { graphQuery } = require("../helper/http");
const { transformBalances } = require("../helper/portedTokens");

// 23573780 is the block number the contract was created.
// const STARTING_BLOCK_NUMBER = 23573780;
const STARTING_BLOCK_NUMBER = 23604000;

const tokens = {
  ETHx: {
    symbol: "ETHx",
    address: "0x46fd5cfb4c12d87acd3a13e92baa53240c661d93",
    underlying_symbol: "ETH",
    underlying_address: "0x0000000000000000000000000000000000000000",
  },
  AF: {
    symbol: "AF",
    address: "0x6c90a582c166f59de91f97fa7aef7315a968b342",
    underlying_symbol: null,
    underlying_address: null,
  },
};

const alfafrensGraphURL =
  "https://api.goldsky.com/api/public/project_clsnd6xsoma5j012qepvucfpp/subgraphs/alfafrens_v2_no_prune/2.0.0/gn";
const superfluidGraphURL = "https://base-mainnet.subgraph.x.superfluid.dev";

const tvl = async (api) => {
  const balances = {};
  let hasData = true;
  let pageSize = 500,
    pageSkip = 0;

  while (hasData) {
    const { userAddresses } = await getUserWalletAddresses(
      api,
      pageSize,
      pageSkip
    );

    const output = await getUserBalancesOnChain(
      api,
      tokens.ETHx,
      userAddresses
    );

    sdk.util.sumMultiBalanceOf(balances, { output });

    if ((hasData = userAddresses.length === pageSize)) {
      pageSkip = pageSkip + pageSize;
      console.debug(`Total users fetched: ${pageSkip}`);
    } else {
      console.debug(`Total users fetched: ${pageSkip + userAddresses.length}`);
    }
  }

  console.debug(
    `Total ETHx Balance: ${balances[tokens.ETHx.underlying_address] * 1e-18}`
  );
  return transformBalances("base", balances);
};

module.exports = {
  timetravel: true,
  methodology: "Total ETH streamed on the platform",
  start: STARTING_BLOCK_NUMBER,
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
  const getWalletBatchQuery = `query getAAUsers($skip: Int = 0, $first: Int = 500, $block: Block_height) {
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

  console.debug("Users fetched: ", users.length);
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
  const tokenBalances = await api.multiCall({
    calls: addresses.map((aa) => ({
      target: token.address,
      params: aa,
    })),
    abi: "erc20:balanceOf",
    withMetadata: true,
  });

  const balance = tokenBalances.reduce((t, b) => t + parseInt(b.output), 0);
  console.debug(
    `${token.symbol} Balance for ${addresses.length} users: ${balance * 1e-18}`
  );

  return tokenBalances.map((t) => {
    // overwrite target with supertoken's underlying token address (if applicable).
    // assuming tokens are 1:1 at this moment.
    t.input.target = token.underlying_address || t.input.target;
    return t;
  });
};
