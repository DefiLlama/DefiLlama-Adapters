const sdk = require("@defillama/sdk");
const { getBlock } = require("../helper/getBlock");
const ADDRESSES = require("./addresses");
const riftVaultAbi = require("./abis/riftVaultAbi");
const uniVaultAbi = require("./abis/uniVaultAbi");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { getChainTransform } = require("../helper/portedTokens");

function getAbi(obj, fnName) {
  return obj.abi.find((x) => x.name === fnName);
}

async function getVaultBalance(timestamp, chainBlocks, chain) {
  const block = await getBlock(timestamp, chain, chainBlocks);
  const balances = {};
  const transform = await getChainTransform(chain);

  const { core, startBlock } = ADDRESSES[chain];

  // Get vaults from events on core address.
  const events = (
    await sdk.api.util.getLogs({
      chain,
      keys: [],
      toBlock: block,
      fromBlock: startBlock,
      target: core,
      topic: "VaultRegistered(address,address)",
    })
  ).output;

  const vaults = events.map((log) => `0x${log.topics[1].substring(26)}`);

  for (const vault of vaults) {
    // Get addresses.
    const token0 = (
      await sdk.api.abi.call({
        abi: getAbi(riftVaultAbi, "token0"),
        chain,
        target: vault,
        block,
      })
    ).output;

    const token1 = (
      await sdk.api.abi.call({
        chain,
        block,
        target: vault,
        abi: getAbi(riftVaultAbi, "token1"),
      })
    ).output;

    const pair = (
      await sdk.api.abi.call({
        chain,
        block,
        target: vault,
        abi: getAbi(uniVaultAbi, "pair"),
      })
    ).output;

    // Get balances.
    const token0Bal = (
      await sdk.api.abi.call({
        chain,
        block,
        target: token0,
        abi: "erc20:balanceOf",
        params: [vault],
      })
    ).output;

    const token1Bal = (
      await sdk.api.abi.call({
        chain,
        block,
        target: token1,
        abi: "erc20:balanceOf",
        params: [vault],
      })
    ).output;

    const pairBal = (
      await sdk.api.abi.call({
        chain,
        block,
        target: pair,
        abi: "erc20:balanceOf",
        params: [vault],
      })
    ).output;

    // Add token balances.
    await sdk.util.sumSingleBalance(balances, transform(token0), token0Bal);
    await sdk.util.sumSingleBalance(balances, transform(token1), token1Bal);

    // Unwrap and add pair balances.
    await unwrapUniswapLPs(
      balances,
      [{ balance: pairBal, token: pair }],
      block,
      chain,
      transform
    );
  }

  return balances;
}

async function aurora(timestamp, block, chainBlocks) {
  return getVaultBalance(timestamp, chainBlocks, "aurora");
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  aurora: {
    tvl: aurora,
  },
};
