async function tvl(api) {
  const pools = await fetch("https://fetchnetworkdatarequest-xqbg2swtrq-uc.a.run.app/?networkId=dymension_1100-1&dataType=pools").then(r=>r.json())
  pools.forEach(pool  => {
    const dymAsset = pool.poolAssets.find(a => a && a.token && a.token.denom === "adym")
    if (!dymAsset) return
    const amount = Number(dymAsset.token.amount /1e18)
    api.addCGToken("dymension", amount * 2)
  })
}

module.exports = {
  methodology: 'Liquidity in DEX',
  dymension:{ tvl }
}
