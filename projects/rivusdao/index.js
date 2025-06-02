const rTokens = [
  // '0x5e17abe30f0b804730c4e4db0ad217d8c29d05a0', // rsTAO
  // '0xcD7D22146ea9F26d0208848B6a1A9d1Bb538245A', // rsCOMAI
  '0x3d8ede6231243d56e7896477789a450ce7fd2ad3' //  rsNMT
]

async function tvl(api) {
  const tokens = await api.multiCall({ abi: 'address:wrappedToken', calls: rTokens })
  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: rTokens })
  // const mintedBal = await api.call({ abi: 'erc20:balanceOf', target: rTokens[1], params: '0xA47F6159Ed855Ed7E9ec3Ca339b1B7491777d08E' })
  api.add(tokens, supplies)
  // api.add(tokens[1], mintedBal * -1)
}

module.exports = {
  methodology: "TVL is calculated as the sum of the total supplies of rsTAO, rsCOMAI and rsNMT tokens.",
  ethereum: {
    tvl,
  },
  hallmarks: [
    ['2024-09-16', 'Migration contract was hacked'],
  ],
};
