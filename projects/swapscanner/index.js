const sdk = require('@defillama/sdk')
const { transformBalances } = require('../helper/portedTokens')
const chain = 'klaytn'

const SCNR = {
  address: "0x8888888888885b073f3c81258c27e83db228d5f3",
  staking: "0x7c59930d1613ca2813e5793da72b324712f6899d",
  LPs: {
    KLAY: "0xe1783a85616ad7dbd2b326255d38c568c77ffa26",
  },
};

const WKLAY = "0xd7a4d10070a4f7bc2a015e78244ea137398c3b74";

async function getTokenPrice(block) {
  const [scnrLPBal, klayLPBal] = await sdk.api2.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: [[SCNR.address, SCNR.LPs.KLAY],[WKLAY, SCNR.LPs.KLAY]].map(([target, params]) => ({ target, params, })),
    chain, block,
  })
  return klayLPBal/scnrLPBal
}

async function staking(_, _b, {klaytn: block}) {
  const scnrBal = await sdk.api2.abi.call({
    abi: 'erc20:balanceOf',
    target: SCNR.address,
    params: SCNR.staking,
    chain, block,
  })
  
  const balances = {}
  sdk.util.sumSingleBalance(balances,WKLAY,scnrBal * await getTokenPrice(block))
  return transformBalances(chain, balances)
}

async function pool2(_, _b, {klaytn: block}) {
  const [klayLPBal, lpBalance] = await sdk.api2.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: [[WKLAY, SCNR.LPs.KLAY],[SCNR.LPs.KLAY, SCNR.staking]].map(([target, params]) => ({ target, params, })),
    chain, block,
  })

  const supply = await sdk.api2.abi.call({
    target: SCNR.LPs.KLAY,
    abi: 'erc20:totalSupply',
    chain, block,
  })

  const balances = {}
  sdk.util.sumSingleBalance(balances,WKLAY,2*klayLPBal * lpBalance/supply)
  return transformBalances(chain, balances)
}


module.exports = {
  klaytn: {
    tvl: async () => ({}),
    staking,
    pool2,
  },
};