const abi = require("./abi.js");
const vaults = Object.values({
  STREAMUSD_WRAPPER_CONTRACT: "0x6eAf19b2FC24552925dB245F9Ff613157a7dbb4C",
  STREAMBTC_WRAPPER_CONTRACT: "0x05F47d7CbB0F3d7f988E442E8C1401685D2CAbE0",
  STREAMETH_WRAPPER_CONTRACT: "0xF70f54cEFdCd3C8f011865685FF49FB80A386a34",
})


const oftContracts = Object.values({
  STREAMUSD_OFT_BASE: "0x212187708d01A63bcbE2F59553537de407a5621D",
  STREAMBTC_OFT_BASE: "0x8A31D2D10f34aAF24A2c48713e213266bc01c68b",
  STREAMETH_OFT_BASE: "0xc5332A5A8cBbB651A427F2cec9F779797311B839"
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
  ethereum: {
    tvl: tvlEth,
  },
};
