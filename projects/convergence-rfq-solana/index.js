
const convergenceRfqSolEndpoint = 'https://mainnet.indexer.convergence.so/rfqs/trading-matrix'

const dataFetcher = async () =>{
    const response = await fetch(convergenceRfqSolEndpoint,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'indexer-key.855ed0656f1c31bb1dda57aa7bdc4353'
      },
    })
    const jsonData = await response.json()
    console.log('json',jsonData)
    return jsonData
}

const tvl = async () =>{  
    const data = await dataFetcher();
    const tvlData = data.tradingVolume.spot.overall + data.tradingVolume.options.overall + data.tradingVolume.futures.overall
    return Number(tvlData)
}


module.exports = {
    methodology: "Calculate TVL of convergence",
    solana: {
      tvl,
    },
  };