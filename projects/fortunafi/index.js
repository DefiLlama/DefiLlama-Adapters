
const config = {
  canto: {
    fbill: '0x79ECCE8E2D17603877Ff15BC29804CbCB590EC08',
    fCOIN: '0x855EA9979189383ef5A85eB74Ed3a02E2604EA81',
    ifBill: '0x45bafad5a6a531Bc18Cf6CE5B02C58eA4D20589b',
  },
  arbitrum: {
    fbill: '0x79ECCE8E2D17603877Ff15BC29804CbCB590EC08',
    fCOIN: '0x108Ec61bd5A91F5596F824832524C6b6002E3F03',
    ifBill: '0x45bafad5a6a531Bc18Cf6CE5B02C58eA4D20589b',
  },
  blast: {
    fbill: '0x79ECCE8E2D17603877Ff15BC29804CbCB590EC08',
    fCOIN: '0xE85Ae7e8Fa0Ee69426019b7D3E77843673807ABE',
    ifBill: '0x45bafad5a6a531Bc18Cf6CE5B02C58eA4D20589b',
  },
  ethereum: {
    fCOIN: '0x2378aC4EEAAe44695E1e3d0fcAEEd6ba8b0F5108',
  },
}

Object.keys(config).forEach(chain => {
  const tokens = Object.values(config[chain])
  module.exports[chain] = {
    tvl: async (api) => {
      const supplies = await api.multiCall({  abi: 'uint256:totalSupply', calls: tokens})
      api.add(tokens, supplies)
    }
  }
})
