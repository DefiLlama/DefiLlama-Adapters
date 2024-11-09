const ADDRESSES = require('../helper/coreAssets.json')

const m2m = {
  polygon: ["0x33efB0868A6f12aEce19B451e0fcf62302Ec4A72"],
  bsc: ["0x9Af655c4DBe940962F776b685d6700F538B90fcf",],
  optimism: ["0x9Af655c4DBe940962F776b685d6700F538B90fcf",],
  arbitrum: ["0x9Af655c4DBe940962F776b685d6700F538B90fcf",],
  era: ["0x240aad990FFc5F04F11593fF4dCF1fF714d6fc80"],
  base: ["0x1F4947Cd5A5c058DD5EA6Fd1CCd5c311aDa9E6Fb", "0x96aa0bBe4D0dea7C4AF4739c53dBFA0300262253"],
  linea: ["0x1F4947Cd5A5c058DD5EA6Fd1CCd5c311aDa9E6Fb"],
  blast: ["0x93dD104528B35E82c061BB0D521096dCF11628FA", "0x1d48DD3094EbB4B9a2c5Ab96dF4ef05bFF562F26"],
}

const assets = {
  polygon: ADDRESSES.polygon.USDC, //USDC
  bsc: ADDRESSES.bsc.BUSD, //BUSD
  optimism: ADDRESSES.optimism.USDC, //USDC
  arbitrum: ADDRESSES.arbitrum.USDC, //USDC
  era: ADDRESSES.era.USDC,
  base: ADDRESSES.base.USDbC, //USDC
  linea: ADDRESSES.linea.USDC, //USDC
  blast: ADDRESSES.blast.USDB // USDB
}

const abi = "uint256:totalNetAssets"

Object.keys(m2m).forEach(chain => {
  const asset = assets[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const balances = await api.multiCall({  abi, calls: m2m[chain]})
      api.add(asset, balances)
    }
  }
})