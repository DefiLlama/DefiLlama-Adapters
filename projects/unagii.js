async function tvl(api) {
  const vaults = [
    '0x4aD0b81f92B16624BBcF46FC0030cFBBf8d02376',
    '0xBc5991cCd8cAcEba01edC44C2BB9832712c29cAB',
    '0x178Bf8fD04b47D2De3eF3f6b3D112106375ad584',
    '0x3aF5Ba94C29a8407785f5f6d90eF5d69a8EB2436',
    '0x77607588222e01bf892a29Abab45796A2047fc7b',
  ]

  const v2Vaults = [
    '0x634b0273D7060313FAA60f96705116c9DE50fA1f',
    '0x49b09e7E434a3A4A924A3b640cBBA54bF93B5677',
    '0xBF8734c5A7b3e6D88aa0110beBB37844AC043d0A',
    '0x7F20551E082ba3E035F2890cBD1EC4E275b9C8C0',
    '0xDe07f45688cb6CfAaC398c1485860e186D55996D',
  ]

  const minters = await api.multiCall({  abi: "address:minter", calls: v2Vaults})
  vaults.push(...minters)
  const tokens = await api.multiCall({  abi: 'address:token', calls: vaults})
  const bals = await api.multiCall({  abi: 'uint256:totalAssets', calls: vaults})
  api.add(tokens, bals)
}

module.exports = {
  ethereum: {
    tvl
  }
}