
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const _xensaCoreAddress = '0xd1242313461dd533279f0cac0dbc06ecdb878a79';

async function tvl(api) {
  const reserves_xensa = (
    await api.call({
      target: _xensaCoreAddress,
      abi: "address[]:getReserves",
    })
  ).filter(addr=>addr!=="0x1111111111111111111111111111111111111111")
  return sumTokens2({ api, owner: _xensaCoreAddress, tokens: [...reserves_xensa, nullAddress], resolveLP: true, })
}

module.exports = {
  methodology: 'Using the same methodology applied to other lending platforms, TVL for Xensa consists deposits made to the protocol and borrowed tokens are not counted.',
  okexchain:{
    tvl: () => 0
  },
  deadFrom: '2022-05-05'
};
