const sdk = require("@defillama/sdk")
const BigNumber = require('bignumber.js')

const pATOM = '0x446E028F972306B5a2C36E81D3d088Af260132B3',
stkATOM = '0x44017598f2AF1bD733F9D87b5017b4E7c1B28DDE',
pXPRT = '0x8793cD84c22B94B1fDD3800f02C4B1dcCa40D50b',
stkXPRT = '0x45e007750Cc74B1D2b4DD7072230278d9602C499'

async function tvl(timestamp, block, chainBlocks) {
  const totalSupplies = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    calls: [pATOM, stkATOM, pXPRT, stkXPRT].map(t => ({target:t})),
    block
  })
  console.log(totalSupplies.output.map(call => call.input.target + ', ' + BigNumber(call.output).div(1e6).toFixed(2)).join('\n'))

  // Dont know why sumMultiBalanceOf do not list pTokens but do list stkTokens, so grouping them manually
  // const balances = {};
  // sdk.util.sumMultiBalanceOf(balances, totalSupplies);
  // Grouping the pToken and stkToken balances manually into stkToken, recognized by defillama
  const totalSuppliesOut = totalSupplies.output
  totalAtom = BigNumber(totalSuppliesOut[0].output).plus(BigNumber(totalSuppliesOut[1].output))
  totalXPRT = BigNumber(totalSuppliesOut[2].output).plus(BigNumber(totalSuppliesOut[3].output))
  balances = {
    '0x44017598f2AF1bD733F9D87b5017b4E7c1B28DDE': totalAtom, // pATOM + stkATOM
    '0x45e007750Cc74B1D2b4DD7072230278d9602C499': totalXPRT  // pXPRT + stkXPRT
  }
  return balances;
}

module.exports = {
  tvl: tvl,
  methodology: `TVL is totalSupply of pATOM + stkATOM wrapped and staked from COSMOS to Eth mainnet, as well as totalSupply of XPRT (p and stk)`
}
