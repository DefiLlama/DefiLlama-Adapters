const sdk = require('@defillama/sdk')

function chainExports(chainTvl, chains){
  const chainTvls = chains.reduce((obj, chain) => ({
    ...obj,
    [chain === 'avax' ? 'avalanche' : chain]: {
      tvl:chainTvl(chain)
    }
  }), {})

  return {
    ...chainTvls,
    tvl: sdk.util.sumChainTvls(Object.values(chainTvls).map(tvl=>tvl.tvl))
  }
}

function fetchChainExports(chainTvl, chains){
  const chainTvls = chains.reduce((obj, chain) => ({
    ...obj,
    [chain === 'avax' ? 'avalanche' : chain]: {
      fetch:chainTvl(chain)
    }
  }), {})

  return {
    ...chainTvls,
    fetch: ()=>{
      return Promise.all(chains.map(c=>chainTvl(c)())).then(cs=>cs.reduce((total, c)=>total+c, 0))
    }
  }
}

module.exports={
    chainExports,
    fetchChainExports
}