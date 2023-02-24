function chainExports(chainTvl, chains){
  const chainTvls = chains.reduce((obj, chain) => ({
    ...obj,
    [chain]: {
      tvl:chainTvl(chain)
    }
  }), {})

  return chainTvls
}

function generalizedChainExports(chainTvl, chains){
  const chainTvls = chains.reduce((obj, chain) => ({
    ...obj,
    [chain]: chainTvl(chain)
  }), {})

  return chainTvls
}

function fetchChainExports(chainTvl, chains){
  const chainTvls = chains.reduce((obj, chain) => ({
    ...obj,
    [chain]: {
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
    fetchChainExports,
    generalizedChainExports
}