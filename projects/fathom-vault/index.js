const FathomVaultFactoryAddress = "0x0c6e3fd64D5f33eac0DCCDd887A8c7512bCDB7D6";
const FXD = '0x49d3f7543335cf38Fa10889CCFF10207e22110B5';

async function tvl(api) {
  const vaults = await api.call({ target: FathomVaultFactoryAddress, abi: "address[]:getVaults", });
  const queue = (await api.multiCall({ abi: "address[]:getDefaultQueue", calls: vaults })).flat()
  queue.push(...vaults)

  return api.sumTokens({ owners: queue, tokens: [FXD] })
}

module.exports = {
  xdc: { tvl, },
}
