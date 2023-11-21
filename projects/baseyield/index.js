const { yieldHelper } = require("../helper/unknownTokens");
const sdk = require('@defillama/sdk')

const MiniChefV2 = "0x3db771B933aC5d824a2411866F1a395DbB026528";
const chain = "base";
const tokenAPI = "address:want"

const abis ={
  lpToken: 'function lpToken(uint256) public view returns (address)',
  poolLength: 'function poolLength() public view returns (uint256)',
}

async function getVaults(block) {

  const { output: length } = await sdk.api.abi.call({
    target: MiniChefV2,
    abi: abis.poolLength,
    chain, block,
  })

  const calls = []
  const vaults = []
  for (let i = 0; i < length; i++){ 
    calls.push({ params: [i] })
    const { output: data } = await sdk.api.abi.multiCall({
      target: MiniChefV2,
      abi: abis.lpToken,
      calls,
      chain, block,
    })
    vaults.push(data[i].output)
  }

  return vaults
}

module.exports = {
  [chain]: {
    tvl: async (_, _b, { [chain]: block }) => {
      vaults = await getVaults(block);
      return yieldHelper({ vaults, chain, block, tokenAPI});
    }
  }
}
