const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const ethereumAddresses = {
  treasuries: ["0x558c8eb91F6fd83FC5C995572c3515E2DAF7b7e0", "0x1332e5373D2eD051589e7852DBE4c08Ba4465259"],
  multisigs: ["0xF6a9bd8F6DC537675D499Ac1CA14f2c55d8b5569"],
  operations: "0xB7bE82790d40258Fd028BEeF2f2007DC044F3459",
  liquidityMining: "0x0b65625f905168EF24829fb625B177f83f1BFe6B",
  ipor: "0x1e4746dC744503b53b4A082cB3607B169a289090",
  oracle: "0x75DC10597861B687ea1c6F955cDDA0c913E2299f"
}
const baseAddresses = {
  multisigs: ["0xF6a9bd8F6DC537675D499Ac1CA14f2c55d8b5569"],
  operations: "0xB7bE82790d40258Fd028BEeF2f2007DC044F3459",
  ipor: "0xbd4e5C2f8dE5065993d29A9794E2B7cEfc41437A"
}
const arbitrumAddresses = {
  treasuries: ["0x7D002e4F8B3ad8fdf782a10e3744c777eeB579Eb"],
  multisigs: ["0x726AC76F27d24E607a282d72CEde705BB48071A6", "0xF6a9bd8F6DC537675D499Ac1CA14f2c55d8b5569"],
  operations: "0xff560c41eacd072AD025F43DF3516cB6580C96bF",
  liquidityMining: "0xb56102180C96B988b78DB3725fe03d8326217c9c",
  ipor: "0x34229B3f16fBCDfA8d8d9d17C0852F9496f4C7BB",
}

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.STETH
    ],
    owners: [...ethereumAddresses.treasuries, ...ethereumAddresses.multisigs, ethereumAddresses.operations, ethereumAddresses.liquidityMining, ethereumAddresses.oracle],
    ownTokens: [ethereumAddresses.ipor],
    resolveLP: true,
  },
  base: {
    tokens: [
      nullAddress,
      ADDRESSES.base.WETH
    ],
    owners: [...baseAddresses.multisigs, baseAddresses.operations],
    ownTokens: [baseAddresses.ipor],
    resolveLP: true
  },
  arbitrum: {
    tokens: [
      nullAddress,
      ADDRESSES.arbitrum.WETH
    ],
    owners: [...arbitrumAddresses.treasuries, ...arbitrumAddresses.multisigs, arbitrumAddresses.operations, arbitrumAddresses.liquidityMining],
    ownTokens: [arbitrumAddresses.ipor],
    resolveLP: true
  }
});
