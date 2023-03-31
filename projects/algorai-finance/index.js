const sdk = require('@defillama/sdk')

const {
  vaults,
  state
} = require("./constants");
const { readGlobalState } = require("./utils");

/**
 * @desc Return tvl
 *
 * @returns {Promise<{"[usdtAddress]": *}>}
 */
async function tvl() {
  const balances = {}
  const promises = vaults.map(async (vault) => {
    const state = await readGlobalState(vault.vaultID, ["vtv"]);
    const totalTvl = state[0] ? state[0] / 10 ** vault.assetDecimals : 0;
    sdk.util.sumSingleBalance(balances, vault.coingecko, totalTvl)
  });
  await Promise.all(promises)

  return balances
}

/**
 *
 * @param decimals
 * @param n
 * @returns {number}
 */
const toNumber = (decimals, n) => Number(n)/Math.pow(10, decimals)

/**
 *
 * @param chain
 * @returns {function(*, *, *): Promise<{}>}
 */
function getTVLFunction(chain)
{
  return async function tvl(timestamp, ethBlock, chainBlocks) {
    const balances = {}
    const chainData = state[chain];

    const block = chainBlocks[chain];
    for (const token of chainData.tokens) {
      const balance = await sdk.api.erc20.balanceOf({
        block, chain, target: token.address, owner: chainData.contractAddress
      });

      sdk.util.sumSingleBalance(balances, token.name, toNumber(token.decimals, balance.output));
    }
    return balances
  }
}

module.exports = {
  timetravel: false,
  algorand: {
    tvl,
  },
  ethereum: {
    tvl: getTVLFunction('ethereum'),
  },
};
