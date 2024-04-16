const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const PORTAL = {
  address: "0x4fe8C658f268842445Ae8f95D4D6D8Cfd356a8C8"
};

async function avax(timestamp, ethBlock, chainBlocks) {
  const chain = "avax";
  const block = chainBlocks[chain];

  const planetType = 5;

  const planetIds = (
    await sdk.api.abi.call({
      block: block,
      target: PORTAL.address,
      params: planetType,
      abi: 'function getIdsByType(uint256 _type) view returns (uint256[])',
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
      target: "0x6026a85e11bd895c934af02647e8c7b4ea2d9808",
      abi: "function totalSupply(uint256 id) view returns (uint256)",
      chain,
    })
  ).output;

  const prices = (
    await sdk.api.abi.multiCall({
      block,
      calls: planetIds.map((id) => ({
        params: id,
      })),
      target: "0x6026a85e11bd895c934af02647e8c7b4ea2d9808",
      abi: "function pricePerShare(uint256 _id) view returns (uint256)",
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
      abi: 'function planetWithdrawalPool(uint256 _id) view returns (address)',
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
      abi: 'function getTokenBalance(uint8 index) view returns (uint256)',
      chain,
    })
  ).output;

  let TotalBalance = supplies.reduce(function (sum, supply, i) {
    return BigNumber(sum)
      .plus(BigNumber(supply.output).times(prices[i].output).dividedBy(1e18))
      .plus(dwpOwnedIdle[i].output);
  }, 0);

  return {
    ["avax:" + ADDRESSES.null]: TotalBalance
  };
}

module.exports = {
  start: 16328353,
    methodology:
    "All Staking Derivatives are included to the TVL with relative underlying price. Also counted the Avax within the Dynamic Withdrawal Pools.",
    doublecounted: true,
  hallmarks: [[1658869201, "Launch of yyAVAX"]],
  avax: {
    tvl: avax,
  },
};
