async function tvl() {
  const pools = await fetch("https://fetchnetworkdatarequest-xqbg2swtrq-uc.a.run.app/?networkId=dymension_1100-1&dataType=pools").then(r=>r.json())
  const dym = pools.reduce((sum, pool)=>{
    const dymAssets = pool.poolAssets.find(a=>a.token.denom === "adym").token.amount/1e18
    return sum+dymAssets
  }, 0)

  return {
    "coingecko:dymension": dym*2
  }
}

module.exports = {
  methodology: 'Liquidity in DEX',
  dymension:{
    tvl
  }
}
