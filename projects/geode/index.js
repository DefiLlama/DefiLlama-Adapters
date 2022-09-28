const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const PORTAL = require("./abis/avax/Portal.json");
const gAVAX = require("./abis/avax/gAVAX.json");
const DWP = require("./abis/avax/DWP.json");

const transformAddress = (addr) => `avax:${addr}`;

async function avax(timestamp, ethBlock, chainBlocks) {
  const chain = "avax";
  const block = chainBlocks[chain];

  const planetType = 5;

  const planetIds = (
    await sdk.api.abi.call({
      block: block,
      target: PORTAL.address,
      params: planetType,
      abi: PORTAL.abi.find((abi) => abi.name === "getIdsByType"),
      chain,
    })
  ).output;

  // Find hosted derivative total Supplies, multiply with pricePerShare
  const supplies = (
    await sdk.api.abi.multiCall({
      block,
      calls: planetIds.map((id) => ({
        params: id,
      })),
      target: gAVAX.address,
      abi: gAVAX.abi.find((abi) => abi.name === "totalSupply"),
      chain,
    })
  ).output;

  const prices = (
    await sdk.api.abi.multiCall({
      block,
      calls: planetIds.map((id) => ({
        params: id,
      })),
      target: gAVAX.address,
      abi: gAVAX.abi.find((abi) => abi.name === "pricePerShare"),
      chain,
    })
  ).output;

  // Find DWP addresses and count only Avax(index:0) balances, excluding gAVAX(index:1) balances
  const dwpAddresses = (
    await sdk.api.abi.multiCall({
      block,
      calls: planetIds.map((id) => ({
        params: id,
      })),
      target: PORTAL.address,
      abi: PORTAL.abi.find((abi) => abi.name === "planetWithdrawalPool"),
      chain,
    })
  ).output;

  const dwpOwnedIdle = (
    await sdk.api.abi.multiCall({
      block,
      calls: dwpAddresses.map((dwpOfId) => ({
        target: dwpOfId.output,
        params: 0,
      })),
      abi: DWP.abi.find((abi) => abi.name === "getTokenBalance"),
      chain,
    })
  ).output;

  let TotalBalance = supplies.reduce(function (sum, supply, i) {
    return BigNumber(sum)
      .plus(BigNumber(supply.output).times(prices[i].output).dividedBy(1e18))
      .plus(dwpOwnedIdle[i].output);
  }, 0);

  return {
    "avax:0x0000000000000000000000000000000000000000": TotalBalance
  };
}

module.exports = {
  start: 16328353,
  misrepresentedTokens: false,
  methodology:
    "All Staking Derivatives are included to the TVL with relative underlying price. Also counted the Avax within the Dynamic Withdrawal Pools.",
  timetravel: true,
  doublecounted: true,
  hallmarks: [[1658869201, "Launch of yyAVAX"]],
  avax: {
    tvl: avax,
  },
};
