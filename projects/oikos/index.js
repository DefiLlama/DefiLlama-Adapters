// Synth Contracts for TVL Calculation
const SYNTHS = [
  { address: "0x1bE8d1de0052b7c2f6F9f8F640aAc622518520eE", symbol: "ODR", decimals: 18 },
  { address: "0x97619B7AB5E5CE6b36203E10b5fc0F34C57b324A", symbol: "iBNB", decimals: 8 },
  { address: "0xB72ef897482B5aCe5815FE0c427720A3BBB0FA59", symbol: "iBTC", decimals: 18 },
  { address: "0x19399869d4582C3B9729fc9B2A3776309d235F13", symbol: "iETH", decimals: 18 },
  { address: "0x4DDaCe4B8d58c3989075d2953FBA81fe69De5389", symbol: "oBNB", decimals: 18 },
  { address: "0x19e0E8413DEe3AfFd94bdd42519d01935a0CF0c2", symbol: "oBTC", decimals: 18 },
  { address: "0x68Db964FfF792D1A427f275D228E759d197471B9", symbol: "oXAU", decimals: 18 },
].map(i => i.address)

// TVL + Fees Calculation Combined into `fetch`
async function tvl(api) {
  const totalSupply = await api.multiCall({ abi: 'erc20:totalSupply', calls: SYNTHS })
  api.add(SYNTHS, totalSupply)
}

module.exports = {
  bsc: {
    tvl
  },
  methodology:
    "TVL is calculated by summing token balances from multiple Synth contracts and Collateral contracts.",
};

