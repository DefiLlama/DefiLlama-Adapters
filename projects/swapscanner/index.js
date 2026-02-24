const SCNR = {
  address: "0x8888888888885b073f3c81258c27e83db228d5f3",
  staking: "0x7c59930d1613ca2813e5793da72b324712f6899d",
  LPs: {
    KLAY: "0xe1783a85616ad7dbd2b326255d38c568c77ffa26",
  },
};

const WKLAY = "0xd7a4d10070a4f7bc2a015e78244ea137398c3b74";

async function getTokenPrice(api) {
  const [scnrLPBal, klayLPBal] = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: [[SCNR.address, SCNR.LPs.KLAY],[WKLAY, SCNR.LPs.KLAY]].map(([target, params]) => ({ target, params, })),
  })
  return klayLPBal/scnrLPBal
}

async function staking(api) {
  const scnrBal = await api.call({
    abi: 'erc20:balanceOf',
    target: SCNR.address,
    params: SCNR.staking,
  })
  
  api.add(WKLAY,scnrBal * await getTokenPrice(api))
}

async function pool2(api) {
  const [klayLPBal, lpBalance] = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: [[WKLAY, SCNR.LPs.KLAY],[SCNR.LPs.KLAY, SCNR.staking]].map(([target, params]) => ({ target, params, })),
  })

  const supply = await api.call({
    target: SCNR.LPs.KLAY,
    abi: 'erc20:totalSupply',
  })

  api.add(WKLAY,2*klayLPBal * lpBalance/supply)
}


module.exports = {
  klaytn: {
    tvl: async () => ({}),
    staking,
    pool2,
  },
};