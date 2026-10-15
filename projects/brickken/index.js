const ESCROW_LATEST_PRICE_ABI = "function issuances(uint256) view returns(uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)";

async function tvl(api) {
  const { factory } = config[api.chain]
  const tokens = await api.fetchList({ lengthAbi: 'idSTOs', itemAbi: 'stoTokens', target: factory, startFromOne: true })
  const escrows = await api.fetchList({ lengthAbi: 'idSTOs', itemAbi: 'stoEscrows', target: factory, startFromOne: true })
  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: tokens })
  // const names = await api.multiCall({  abi: 'string:name', calls: tokens})
  const issuanceIndex = await api.multiCall({ abi: 'uint256:issuanceIndex', calls: escrows })
  const payTokens = await api.multiCall({ abi: 'address:paymentToken', calls: escrows })
  const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: payTokens })
  const lastPrice = await api.multiCall({ abi: ESCROW_LATEST_PRICE_ABI, calls: escrows.map((escrow, idx) => ({ target: escrow, params: issuanceIndex[idx] })) })

  // const print = []
  payTokens.forEach((token, idx) => {
    // print.push({ name: names[idx], token: tokens[idx], supply: supplies[idx]/1e18, price: lastPrice[idx][9]/1e18, tvl: supplies[idx] * lastPrice[idx][9]/ 1e42 })
    api.add(token, supplies[idx] * lastPrice[idx][9] / 10 ** (36 - decimals[idx]))
  })
  // console.table(print)
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `We get the TVL as the sum of all total supplies of all tokens issued by our factory multiplied by the price of their latest public price.`
}

const config = {
  ethereum: { factory: '0x91af681C85Ca98Efc5D69C1B62E6F435030969Db', },
  bsc: { factory: '0xCe4529Fe88df480BD777d3e32dfD7032e6C685ff', },
  base: { factory: '0x278D7bdc2451B0Fa4087A68ce084a86cB91D4d83', },
  avax: { factory: '0xc6c230FA8F40022dE997727436Fae01caAbcDe61', },
  polygon: { factory: '0x1bb57e2Abf2822C01cCAeBcCBc9D16C7fD0c1956', },
  adi: { factory: '0x1bb57e2Abf2822C01cCAeBcCBc9D16C7fD0c1956', },
  taiko: { factory: '0xF4443f86B969f2DEf2dc4e784b22987a44943CE5', },
  xdc: { factory: '0x6452831d759EA8F6cE1Ac0D4a2A6ff6D3E2E0Ca9', },
  mantra: { factory: '0x8ed6601a5Bb34396fc93C9B1feA3dA24ED0c5800', },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})