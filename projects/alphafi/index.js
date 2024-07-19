const sui = require("../helper/chain/sui")
const { addUniV3LikePosition } = require("../helper/unwrapLPs")

const ALPHAFI_TVL_IDS = [
  {

    poolID: "0x30066d9879374276dc01177fbd239a9377b497bcd347c82811d75fcda35b18e5",
    cetusPoolID: "0xc8d7a1503dc2f9f5b05449a87d8733593e2f0f3e7bffd90541252782e4d2ca20",
    investorID: "0x87a76889bf4ed211276b16eb482bf6df8d4e27749ebecd13017d19a63f75a6d5",
    token0Type: "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
    token1Type: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN"
  },
  {
    poolID: "0xa7239a0c727c40ee3a139689b16b281acfd0682a06c23531b184a61721ece437",
    cetusPoolID: "0x0e809689d04d87f4bd4e660cd1b84bf5448c5a7997e3d22fc480e7e5e0b3f58d",
    investorID: "0x1b923520f19660d4eb013242c6d03c84fdea034b8f784cfd71173ef72ece50e1",
    token0Type: "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdy::USDY",
    token1Type: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN"
  },
  {
    poolID: "0xee6f6392cbd9e1997f6e4cf71db0c1ae1611f1f5f7f23f90ad2c64b8f23cceab",
    cetusPoolID: "0xcf994611fd4c48e277ce3ffd4d4364c914af2c3cbb05f7bf6facd371de688630",
    investorID: "0xb6ca8aba0fb26ed264a3ae3d9c1461ac7c96cdcbeabb01e71086e9a8340b9c55",
    token0Type: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
    token1Type: "0x2::sui::SUI"
  },
  {
    poolID: "0x676fc5cad79f51f6a7d03bfa3474ecd3c695d322380fc68e3d4f61819da3bf8a",
    cetusPoolID: "0xaa57c66ba6ee8f2219376659f727f2b13d49ead66435aa99f57bb008a64a8042",
    investorID: "0x9ae0e56aa0ebc27f9d8a17b5a9118d368ba262118d878977b6194a10a671bbbc",
    token0Type: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
    token1Type: "0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN"
  },
  {
    poolID: "0xbdf4f673b34274f36be284bca3f765083380fefb29141f971db289294bf679c6",
    cetusPoolID: "0x5b0b24c27ccf6d0e98f3a8704d2e577de83fa574d3a9060eb8945eeb82b3e2df",
    investorID: "0x05fa099d1df7b5bfb2e420d5ee2d63508db17c40ce7c4e0ca0305cd5df974e43",
    token0Type: "0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN",
    token1Type: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN"
  },
]

const ALPHAFI_POOL2_IDS = [{
  poolID: "0x594f13b8f287003fd48e4264e7056e274b84709ada31e3657f00eeedc1547e37",
  cetusPoolID: "0xda7347c3192a27ddac32e659c9d9cbed6f8c9d1344e605c71c8886d7b787d720",
  investorID: "0x46d901d5e1dba34103038bd2ba789b775861ea0bf4d6566afd5029cf466a3d88",
  token0Type: "0xfe3afec26c59e874f3c1d60b8203cb3852d2bb2aa415df9548b8d688e6683f93::alpha::ALPHA",
  token1Type: "0x2::sui::SUI"
},
]

const ALPHA_POOL_ID = "0x6ee8f60226edf48772f81e5986994745dae249c2605a5b12de6602ef1b05b0c1"
const ALPHA_COIN_TYPE = "0xfe3afec26c59e874f3c1d60b8203cb3852d2bb2aa415df9548b8d688e6683f93::alpha::ALPHA"

function asIntN(int, bits = 32) {
  return Number(BigInt.asIntN(bits, BigInt(int)))
}

async function addPoolTVL(api, pools) {
  for (const { poolID, cetusPoolID, investorID, token0Type, token1Type } of pools) {
    let investorObject = await sui.getObject(investorID)
    let poolObject = await sui.getObject(poolID)
    let cetusPoolObject = await sui.getObject(cetusPoolID)
    addUniV3LikePosition({
      api,
      tickLower: asIntN(investorObject.fields.lower_tick),
      tickUpper: asIntN(investorObject.fields.upper_tick),
      tick: asIntN(cetusPoolObject.fields.current_tick_index.fields.bits),
      liquidity: poolObject.fields.tokensInvested,
      token0: token0Type,
      token1: token1Type
    })
  }
}

async function tvl(api) {
  await addPoolTVL(api, ALPHAFI_TVL_IDS)
}
async function pool2(api) {
  await addPoolTVL(api, ALPHAFI_POOL2_IDS)
}

async function staking(api) {
  let alphaPoolObject = await sui.getObject(ALPHA_POOL_ID)
  api.addToken(ALPHA_COIN_TYPE, Number(alphaPoolObject.fields.alpha_bal))
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  sui: {
    tvl, pool2, staking,
  },
}