const { sumTokensExport, nullAddress } = require("../helper/sumTokens");

const ybtc = '0x2cd3cdb3bd68eea0d3be81da707bc0c8743d7335'

// async function tvl(api) {
//   const supply = await api.call({  abi: 'erc20:totalSupply', target: ybtc })
//   api.add(ybtc, supply)
// }

module.exports = {
  timetravel: false,
  // btr: { tvl },
  // avax: { tvl },
  btr: { tvl: sumTokensExport({
    owners: [ybtc],
    tokens: [
      nullAddress,
    ],
  }), },
  avax: { tvl: sumTokensExport({
    owners: [ybtc],
    tokens: [
      nullAddress,
    ],
  }), },
}
