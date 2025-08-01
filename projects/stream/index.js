const abi = require("./abi.js");
const vaults = Object.values({
  STREAMUSD_WRAPPER_CONTRACT: "0x6eAf19b2FC24552925dB245F9Ff613157a7dbb4C",
  STREAMBTC_WRAPPER_CONTRACT: "0x05F47d7CbB0F3d7f988E442E8C1401685D2CAbE0",
  STREAMETH_WRAPPER_CONTRACT: "0xF70f54cEFdCd3C8f011865685FF49FB80A386a34",
  STREAMEUR_WRAPPER_CONTRACT: "0xDCFd98A5681722DF0d93fc11b9205f757576a427",
})



async function tvlEth(_, _1, _2, { api }) {
  const bals = await api.multiCall({  abi: abi.totalSupply, calls: vaults})
  const tokens = await api.multiCall({  abi: abi.asset, calls: vaults})
  api.addTokens(tokens, bals)
}


module.exports = {
  misrepresentedTokens: true,
  methodology: "Calculates the TVL of all Stream vaults",
  start: 1739697390,
  hallmarks: [[1740283200, "Stream V2 Launch"]],
  ethereum: {
    tvl: tvlEth,
  },
};
