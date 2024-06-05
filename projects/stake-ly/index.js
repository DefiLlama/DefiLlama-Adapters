const sdk = require("@defillama/sdk");

async function tvl(timestamp, _ethBlock, {klaytn: block}) {
  const chain = "klaytn";
  const stKlayAddress = "0xF80F2b22932fCEC6189b9153aA18662b15CC9C00"

  const pooledKlay = await sdk.api.abi.call({
    block,
    chain,
    target: stKlayAddress,
    abi: "uint256:totalStaking",
  });

  return {
    "klay-token": Number(pooledKlay.output) / 1e18,
  };
}

module.exports = {
      methodology:
    "TVL is KLAY staked by the users and rewards accrued from node staking",
  start: 1663585837,
  klaytn: {
    tvl,
  },
};
