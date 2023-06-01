const { sumTokens2 } = require('../helper/unwrapLPs');

const treasury = "0x30d5D30e43b6167a345f3D71d61673464e16d711"

async function tvl(){
  const balances = await sumTokens2({owner: treasury, resolveUniV3: true, chain: "arbitrum"});

  return balances;
}

module.exports={
    methodology: `Liquidity deposited in the UniswapV3 Pool`,
    arbitrum:{
        tvl,
    }
}