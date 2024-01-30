

const { request, } = require('graphql-request')
const { getLogs } = require('../helper/cache/getLogs')
const abi = require("./abi.json");
const { sumTokens2, } = require('../helper/unwrapLPs');

const ichi = "0x111111517e4929D3dcbdfa7CCe55d30d4B6BC4d6";
module.exports = {
  methodology: "TVL of the deployed liquidity and non deployed liquidity with in the Vaults.",
  misrepresentedTokens: true,
  doublecounted: true,
} // node test.js projects/ichifarm/index.js

const defaultEvent = 'event ICHIVaultCreated (address indexed sender, address ichiVault, address tokenA, bool allowTokenA, address tokenB, bool allowTokenB, uint24 fee, uint256 count)'
const defaultTopic = '0xde147f43b6837f282eee187234c866cf001806167325f3ea883e36bed0c16a20'
const algebraEvent = 'event ICHIVaultCreated (address indexed sender, address ichiVault, address tokenA, bool allowTokenA, address tokenB, bool allowTokenB, uint256 count)'
const algebraTopic = '0xc40564e4b61a849e6f9fd666c2109aa6ceffc5a019f87d4d3e0eaaf807b0783e'

const config = {
 
  eon: {
    vaultConfigs: [
      { factory: '0x242cd12579467983dc521D8aC46EB13936ab65De', fromBlock: 638510, isAlgebra: false, }, // Ascent
    ]
  },
  
}

Object.keys(config).forEach(chain => {
  const { vaultConfigs = [], oneFactory } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const blacklistedTokens = []
      if (oneFactory) {
        const oneTokens = await api.fetchList({ lengthAbi: abi.oneTokenCount, itemAbi: abi.oneTokenAtIndex, target: oneFactory })
        const oneTokenOwners = await api.multiCall({ abi: abi.owner, calls: oneTokens })
        const foreignTokens = await api.fetchList({ lengthAbi: abi.foreignTokenCount, itemAbi: abi.foreignTokenAtIndex, target: oneFactory })
        const modulesList = await api.fetchList({ lengthAbi: abi.moduleCount, itemAbi: abi.moduleAtIndex, target: oneFactory })
        const moduleDetails = await api.multiCall({ abi: abi.modules, calls: modulesList, target: oneFactory })

        const strategiesList = []
        moduleDetails.forEach((data, i) => {
          if (data.moduleType == 2) { //modeuleType 2 are strategies
            strategiesList.push(modulesList[i])
          }
        })


        blacklistedTokens.push(...oneTokens.map(i => i.toLowerCase()))
        await sumTokens2({ api, tokens: foreignTokens, owners: [oneTokens, strategiesList].flat(), blacklistedTokens })
        const uniV3NFTHolders = [...strategiesList, ...oneTokenOwners]

        await sumTokens2({ api, owners: uniV3NFTHolders, resolveUniV3: true, blacklistedTokens, })
      }

      for (const { 
        factory, 
        fromBlock, 
        isAlgebra, 
      } of vaultConfigs) {
        const topic = isAlgebra ? algebraTopic : defaultTopic 
        const eventAbi = isAlgebra ? algebraEvent : defaultEvent 
        const logs = await getLogs({
          api,
          target: factory,
          topics: [topic],
          eventAbi: eventAbi,
          onlyArgs: true,
          fromBlock,
        })
        const vaultBalances = await api.multiCall({ abi: abi.getTotalAmounts, calls: logs.map(l => l.ichiVault) })
        vaultBalances.forEach((b, i) => {
          const { tokenA, tokenB } = logs[i]
          if (!blacklistedTokens.includes(tokenA.toLowerCase())) api.add(tokenA, b.total0)
          if (!blacklistedTokens.includes(tokenB.toLowerCase())) api.add(tokenB, b.total1)
        })
      }



      const graphQueryPagedWithoutBlock = `
      query MyQuery {
        tokens {
          id
          name
          totalValueLockedUSD
          decimals
          totalValueLocked
        }
      }
    `

    const data = await request('https://eon-graph.horizenlabs.io/subgraphs/name/surfacing8671/v3AscentFull2', graphQueryPagedWithoutBlock);

    const transformedData = {};

    data.tokens.forEach(token => {
      const token0Id = 'eon:' + token.id;
   
    
      const token0Amount = BigInt(Math.round(parseFloat(token.totalValueLocked) * 10 ** token.decimals));
  


      if (!transformedData[token0Id] || token0Amount > BigInt(transformedData[token0Id])) {
        transformedData[token0Id] = token0Amount.toString();
      }
    

    });


      const updatedData = { ...transformedData };

Object.entries(api.getBalances()).forEach(([address, amount]) => {
  if (!updatedData[address.toLowerCase()] || parseFloat(amount) > parseFloat(updatedData[address.toLowerCase()])) {
    updatedData[address.toLowerCase()] = amount;
  }
});


      





      return updatedData
    }
  }
})

