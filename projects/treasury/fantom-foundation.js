const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

//on chain part
const Treasury = "0xa51b1bc907fe0a6bc6538c5c56472c1d9c60de23";  //mainly on eth chain
const Treasury1 = "0x431e81e5dfb5a24541b5ff8762bdef3f32f96354"; // mainly fantom and eth chain
const Treasury2 = "0xca81dbbbb9389a5387f0acad4d018756a04d7f2c"; // eth chain
const Treasury3 = "0xf72f6fba7d55b00c25f2e5205e6bca9aaa470434"; // eth chain
const Treasury4 = "0xeb8a4eadd643ea3873dfecfba18bd709d3206919"; // mainly eth and some fantom chain

const reserver_emergency_wallet = "0xb5c484af0c7a2946ebfb5d912a22a701fb8e3f70"

//own tokens

const FTM_fantom = nullAddress
const FTM_ethereum = "0x4e15361fd6b4bb609fa63c81a2be19d873717870"


module.exports = treasuryExports({
  ethereum: {
    owners: [Treasury, Treasury1, Treasury2, Treasury3, Treasury4, reserver_emergency_wallet],
    ownTokens: [FTM_ethereum]
  },
  fantom: {
    owners: [Treasury1],
    ownTokens: [FTM_fantom]
  },
  bsc: {
    owners: [Treasury1],
  },
  optimism: {
    owners: [Treasury4],
  }
})