const { sumTokensExport, nullAddress } = require("../helper/sumTokens");

const ybtc_b = '0x2cd3cdb3bd68eea0d3be81da707bc0c8743d7335'

async function tvl(api) {
  const supply = await api.call({  abi: 'erc20:totalSupply', target: ybtc_b })
  api.add(ybtc_b, supply)
}

module.exports = {
  timetravel: false,
  btr: { tvl: sumTokensExport({
    owners: [ybtc_b],
    tokens: [
      nullAddress,
    ],
  }), },
  avax: { tvl },
}
