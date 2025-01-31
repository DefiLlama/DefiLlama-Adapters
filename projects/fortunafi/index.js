
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
    fBill: '0x108Ec61bd5A91F5596F824832524C6b6002E3F03',
    ifBill: '0x4B57e1E3fd684d3bb82A0652c77FD7412dF6a2A5',
    fCOIN: '0x2378aC4EEAAe44695E1e3d0fcAEEd6ba8b0F5108',
    ifCOIN: '0xA6d0f5bb034312f9a4fC565e916B84c264160994',
    fHOOD: '0x62C5e58001f91E65C420c4dc4c2F2FAA2264f846',
    ifHOOD: '0x7fC6B348368c34013aaC4a7888883b886226E95e',
    fSPQQQ: '0x3010E93c37092991E9C1Cc7f7Eeed44148836657',
    ifSPQQQ: '0x6D34113F41d5C3b327b6417fC17Ea449C71eA6f4',
    fHV1: '0xD71412e045825d52b38355F8ade1230DD2E393e4',
    ifHV1: '0xE7638CB7ad2384D635d2C49AeBE76cfbcceC50ed'
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
