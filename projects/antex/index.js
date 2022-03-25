const sdk = require("@defillama/sdk");
const { transformBscAddress } = require("../helper/portedTokens");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const DEX_ADDRESS_PAIR_CONTRACT = "0x39B8A10735D1055C8313B1b0732A1c205f4E7635";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformBscAddress();

  const lpBalance = (
    await sdk.api.abi.call({
      abi: abi.totalSupplyLP,
      chain: "bsc",
      target: DEX_ADDRESS_PAIR_CONTRACT,
      block: chainBlocks["bsc"],
    })
  ).output;

  await unwrapUniswapLPs(
    balances,
    [{ token: DEX_ADDRESS_PAIR_CONTRACT, balance: lpBalance }],
    chainBlocks["bsc"],
    "bsc",
    transform
  );

  return balances;
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  bsc: {
    tvl,
  },
};