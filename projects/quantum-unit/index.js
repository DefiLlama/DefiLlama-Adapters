const sdk = require("@defillama/sdk");
const QUANTUM_UNIT_CONTRACT = "0x81889aec6fdc400ec9786516c3adc14d59fc361e";
const WBNB_CONTRACT = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
async function tvl(timestamp, block, chainBlocks, { api }) {
  const collateralBalance = await sdk.api.eth.getBalance({
    target: QUANTUM_UNIT_CONTRACT,
    block: chainBlocks.bsc,
    chain: "bsc"
  })
  api.add(WBNB_CONTRACT, collateralBalance.output)
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'count all contract balance',
  bsc: {
    tvl,
  }
};
