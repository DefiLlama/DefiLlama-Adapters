const FACTORY_ETH_CONTRACT = '0x91af681C85Ca98Efc5D69C1B62E6F435030969Db';
const ESCROW_LATEST_PRICE_ABI = "function issuances(uint256) view returns(uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)";

async function tvl(_, _1, _2, { api }) {
  const tokens = await api.fetchList({  lengthAbi: 'idSTOs', itemAbi: 'stoTokens', target: FACTORY_ETH_CONTRACT, startFromOne: true })
  const escrows = await api.fetchList({  lengthAbi: 'idSTOs', itemAbi: 'stoEscrows', target: FACTORY_ETH_CONTRACT, startFromOne: true })
  const supplies = await api.multiCall({  abi: 'erc20:totalSupply', calls: tokens})
  // const names = await api.multiCall({  abi: 'string:name', calls: tokens})
  const issuanceIndex = await api.multiCall({  abi: 'uint256:issuanceIndex', calls: escrows})
  const payTokens = await api.multiCall({  abi: 'address:paymentToken', calls: escrows})
  const decimals = await api.multiCall({abi: 'erc20:decimals', calls: payTokens})
  const lastPrice = await api.multiCall({  abi:ESCROW_LATEST_PRICE_ABI, calls: escrows.map((escrow, idx) => ({target: escrow, params: issuanceIndex[idx]}))})

  // const print = []
  payTokens.forEach((token, idx) => {
    // print.push({ name: names[idx], token: tokens[idx], supply: supplies[idx]/1e18, price: lastPrice[idx][9]/1e18, tvl: supplies[idx] * lastPrice[idx][9]/ 1e42 })
    api.add(token, supplies[idx] * lastPrice[idx][9]/ 10 ** (36-decimals[idx]))
  })
  // console.table(print)
}

module.exports = {
  ethereum: {
    tvl,
  },
  methodology: `We get the TVL as the sum of all total supplies of all tokens issued by our factory multiplied by the price of their latest public price.`
}; 