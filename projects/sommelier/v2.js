async function sumTvl({ cellars, api, ownersToDedupe }) {

  const assets = await api.multiCall({
    abi: "address:asset",
    calls: cellars,
  }); 
  const bals = await api.multiCall({
    abi: "uint256:totalAssets",
    calls: cellars,
  });

  // Dedupe any potential TVL of cellars taking positions in other cellars by looking at balanceOf for each cellar

  const sharesToIgnore = await Promise.all(
    cellars.map(async (target) => {
      // Iterate over all owners and sum up their shares for each cellar (target)
      const shares = await api.multiCall({
        calls: ownersToDedupe.map((owner) => ({
          target: target, // Base Cellar
          params: [owner.id], // Potential cellar holding shares in base cellar
        })),
        abi: "erc20:balanceOf",
      });

      // Sum up all shares for each cellar (target)
      const totalShares = shares.reduce(
        (sum, share) => sum + Number(share),
        0
      );

      return totalShares;
    })
  );

  // Create a new map of total shares by using totalSupply
  let totalShares = await api.multiCall({
    calls: cellars.map((cellar) => ({
      target: cellar, // Base Cellar
    })),
    abi: "uint256:totalSupply",
  });
  // Clean up to be list of outputs
  totalShares = totalShares.map((share) => share);

  // Create a ratio of 1-(sharesToIgnore/totalShares) to multiply by the totalAssets
  const ratios = totalShares.map((share, i) => {
    const ratio = 1 - sharesToIgnore[i] / share;
    return ratio;
  });

  assets.forEach((a, i) => api.add(a, bals[i] * ratios[i]));
}

module.exports = {
  sumTvl,
};
