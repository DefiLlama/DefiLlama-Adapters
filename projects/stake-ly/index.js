const sdk = require("@defillama/sdk");
const { getBlock } = require("../helper/getBlock");

async function tvl(timestamp, _ethBlock, chainBlocks) {
  const chain = "klaytn";
  const stKlayAddress = "0xF80F2b22932fCEC6189b9153aA18662b15CC9C00"

  const block = await getBlock(timestamp, chain, chainBlocks, true);

  const pooledKlay = await sdk.api.abi.call({
    block,
    chain,
    target: stKlayAddress,
    abi: {
      inputs: [],
      name: "totalStaking",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  });

  return {
    "klay-token": Number(pooledKlay.output) / 1e18,
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "TVL is KLAY staked by the users and rewards accrued from node staking",
  start: 1663585837,
  klaytn: {
    tvl,
  },
};
