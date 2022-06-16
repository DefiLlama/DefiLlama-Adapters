// const ethers = require("ethers");
// const { config } = require("@defillama/sdk/build/api");
const { getUniTVL } = require("../helper/unknownTokens")

// TODO: Remove when no longer needed
// config.setProvider(
//   "sx",
//   new ethers.providers.StaticJsonRpcProvider(
//     "https://rpc.sx.technology",
//     {
//       name: "sx",
//       chainId: 416,
//     }
//   )
// );

module.exports = {
  sx: {
    tvl: getUniTVL({
      chain: 'sx',
      factory: '0x5Da4BEe3E6B545e9E28a7A303168A51eBd14C2Cf',
      coreAssets: [
        ...Object.values({
          WSX: '0x90d27E008d5Db7f0a3c90a15A8Dcc4Ca18cFc670',
          WETH: '0xA173954Cc4b1810C0dBdb007522ADbC182DaB380',
          USDC: '0xe2aa35C2039Bd0Ff196A6Ef99523CC0D3972ae3e',
          WMATIC: '0xfa6F64DFbad14e6883321C2f756f5B22fF658f9C',
          DAI: '0x53813CD4aCD7145A716B4686b195511FA93e4Cb7',
          SHARK: '0xa0cB58E7F783fce0F4042C790ea3045c48CD51e8',
        })
      ]
    })
  }
}