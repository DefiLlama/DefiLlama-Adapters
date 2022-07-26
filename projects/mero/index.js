const sdk = require("@defillama/sdk");
const abi = require("./abi.json");


const chain = "ethereum"

async function tvl(timestamp, ethBlock, chainBlock) {
  const balances = {}
  
  const strategies = [
    "0x2C681E62De119DdCC8bb7E78D7eB92D6C88BcAFe",
    "0xdA83E512e2D675B8De524a6d21c86254dC7d47B6"
]
  

  const { output: tokens } = await sdk.api.abi.multiCall({
    abi: abi.getUnderlying,
    calls: strategies.map(i => ({ target: i})),
    chain, ethBlock,
  })

  const { output: deposits } = await sdk.api.abi.multiCall({
    abi: abi.totalUnderlying,
    calls: strategies.map(i => ({ target: i})),
    chain, ethBlock,
  })


  tokens.forEach((data, i) => {
    sdk.util.sumSingleBalance(balances, data.output, deposits[i].output)
  })
  

  return balances
}

module.exports = {
    methodology: 'Counts the DAI and USDC that has been deposited into the protocol',
    ethereum: {
        tvl
    }
};