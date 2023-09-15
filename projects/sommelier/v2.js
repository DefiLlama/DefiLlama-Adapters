const sdk = require("@defillama/sdk");
const { cellarsV2, cellarsV2p5 } = require("./cellar-constants");

async function sumTvl({ balances, cellars, api }) {
  const assets = await api.multiCall({  abi: "address:asset", calls: cellars}) 
  const bals = await api.multiCall({  abi: "uint256:totalAssets", calls: cellars})

  // Dedupe any potential TVL of cellars taking positions in other cellars by looking at balanceOf for each cellar

  // Concatenate cellar owners to dedupe (only need v2+, older veriosns dont take positions in other cellars)
  const owners = cellarsV2.concat(cellarsV2p5)

  const sharesToIgnore = await Promise.all(
    cellars.map(async (target) => {
      // Iterate over all owners and sum up their shares for each cellar (target)
      const shares = await sdk.api.abi.multiCall({
        calls: owners.map((owner) => ({
          target: target, // Base Cellar
          params: owner.id, // Potential cellar holding shares in base cellar
        })),
        abi: "erc20:balanceOf",
      });

      // Sum up all shares for each cellar (target)
      const totalShares = shares.output.reduce((sum, share) => sum + Number(share.output), 0);

      return totalShares;
    })
  );

  // Create a new map of total shares by using totalSupply
  let totalShares = await sdk.api.abi.multiCall({
    calls: cellars.map((cellar) => ({
      target: cellar, // Base Cellar
    })),
    abi: "uint256:totalSupply",
  });
  // Clean up to be list of outputs
  totalShares = totalShares.output.map((share) => share.output);

  // Create a ratio of 1-(sharesToIgnore/totalShares) to multiply by the totalAssets
  const ratios = totalShares.map((share, i) => {
    const ratio = 1 - sharesToIgnore[i] / share;
    return ratio;
  });

  assets.forEach((a, i) =>
    sdk.util.sumSingleBalance(
      balances,
      a,
      bals[i] * ratios[i],
      api.chain
    )
  );
  return balances
}

module.exports = {
  sumTvl,
};
