const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui")
const { addUniV3LikePosition } = require("../helper/unwrapLPs")

const ALPHAFI_CETUS_TVL_IDS = [
  {

    poolID: "0x30066d9879374276dc01177fbd239a9377b497bcd347c82811d75fcda35b18e5",
    cetusPoolID: "0xc8d7a1503dc2f9f5b05449a87d8733593e2f0f3e7bffd90541252782e4d2ca20",
    investorID: "0x87a76889bf4ed211276b16eb482bf6df8d4e27749ebecd13017d19a63f75a6d5",
    token0Type: ADDRESSES.sui.USDT,
    token1Type: ADDRESSES.sui.USDC
  },
  {
    poolID: "0xa7239a0c727c40ee3a139689b16b281acfd0682a06c23531b184a61721ece437",
    cetusPoolID: "0x0e809689d04d87f4bd4e660cd1b84bf5448c5a7997e3d22fc480e7e5e0b3f58d",
    investorID: "0x1b923520f19660d4eb013242c6d03c84fdea034b8f784cfd71173ef72ece50e1",
    token0Type: "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdy::USDY",
    token1Type: ADDRESSES.sui.USDC
  },
  {
    poolID: "0xee6f6392cbd9e1997f6e4cf71db0c1ae1611f1f5f7f23f90ad2c64b8f23cceab",
    cetusPoolID: "0xcf994611fd4c48e277ce3ffd4d4364c914af2c3cbb05f7bf6facd371de688630",
    investorID: "0xb6ca8aba0fb26ed264a3ae3d9c1461ac7c96cdcbeabb01e71086e9a8340b9c55",
    token0Type: ADDRESSES.sui.USDC,
    token1Type: ADDRESSES.sui.SUI
  },
  {
    poolID: "0x676fc5cad79f51f6a7d03bfa3474ecd3c695d322380fc68e3d4f61819da3bf8a",
    cetusPoolID: "0xaa57c66ba6ee8f2219376659f727f2b13d49ead66435aa99f57bb008a64a8042",
    investorID: "0x9ae0e56aa0ebc27f9d8a17b5a9118d368ba262118d878977b6194a10a671bbbc",
    token0Type: ADDRESSES.sui.USDC,
    token1Type: ADDRESSES.sui.WBTC
  },
  {
    poolID: "0xbdf4f673b34274f36be284bca3f765083380fefb29141f971db289294bf679c6",
    cetusPoolID: "0x5b0b24c27ccf6d0e98f3a8704d2e577de83fa574d3a9060eb8945eeb82b3e2df",
    investorID: "0x05fa099d1df7b5bfb2e420d5ee2d63508db17c40ce7c4e0ca0305cd5df974e43",
    token0Type: ADDRESSES.sui.WETH,
    token1Type: ADDRESSES.sui.USDC
  },
  { 
    poolID: "0x045e4e3ccd383bedeb8fda54c39a7a1b1a6ed6a9f66aec4998984373558f96a0",
    cetusPoolID: "0x0254747f5ca059a1972cd7f6016485d51392a3fde608107b93bbaebea550f703",
    investorID: "0xdd9018247d579bd7adfdbced4ed39c28821c6019461d37dbdf32f0d409959b1c",
    token0Type: "0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044e5544b5::navx::NAVX",
    token1Type: ADDRESSES.sui.SUI
  },
  {
    poolID: "0x59ff9c5df31bfd0a59ac8393cf6f8db1373252e845958953e6199952d194dae4",
    cetusPoolID: "0x81fe26939ed676dd766358a60445341a06cea407ca6f3671ef30f162c84126d5",
    investorID: "0x8051a9ce43f9c21e58331b1ba2b1925e4ae4c001b1400459236d86d5d3d2888b",
    token0Type: ADDRESSES.sui.BUCK,
    token1Type: ADDRESSES.sui.USDC
  },
  {
    poolID: "0xd50ec46c2514bc8c588760aa7ef1446dcd37993bc8a3f9e93563af5f31b43ffd",
    cetusPoolID: "0x9ddb0d269d1049caf7c872846cc6d9152618d1d3ce994fae84c1c051ee23b179",
    investorID: "0x74308f0de7ea1fc4aae2046940522f8f79a6a76db94e1227075f1c2343689882",
    token0Type: ADDRESSES.sui.SOL,
    token1Type: ADDRESSES.sui.USDC
  },
  {
    poolID: "0x6eec371c24ad264ced3a1f40b83d7d720aa2b0afa860a6af85436f6a769842e1",
    cetusPoolID: "0xaa72bd551b25715b8f9d72f226fa02526bdf2e085a86faec7184230c5209bb6e",
    investorID: "0x651acc1166023a08c17f24e71550982400e9b1f4950cc1324410300efc1af905",
    token0Type: "0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA",
    token1Type: ADDRESSES.sui.SUI
  },
  // usdc sui
  {
    poolID: "0x727882553d1ab69b0cabad2984331e7e39445f91cb4046bf7113c36980685528",
    cetusPoolID: "0xb8d7d9e66a60c239e7a60110efcf8de6c705580ed924d0dde141f4a0e2c90105",
    investorID: "0xba6acd0350eab1c6bc433b6c869e5592fe0667ae96a3115f89d5c79dd78396ef",
    token0Type: ADDRESSES.sui.USDC_CIRCLE,
    token1Type: ADDRESSES.sui.SUI
  },
  // usdc usdt
  {
    poolID: "0xa213f04c6049f842a7ffe7d39e0c6138a863dc6e25416df950d23ddb27d75661",
    cetusPoolID: "0x6bd72983b0b5a77774af8c77567bb593b418ae3cd750a5926814fcd236409aaa",
    investorID: "0xe553be450b7290025d5810da45102abdbaa211c5735e47f6740b4dd880edc0bd",
    token0Type: ADDRESSES.sui.USDC_CIRCLE,
    token1Type: ADDRESSES.sui.USDT
  },
  // usdc wusdc
  {
    poolID: "0x568a47adf2b10219f0973a5600096822b38b4a460c699431afb6dad385614d66",
    cetusPoolID: "0x1efc96c99c9d91ac0f54f0ca78d2d9a6ba11377d29354c0a192c86f0495ddec7",
    investorID: "0x6cc5e671a2a6e9b8c8635ff1fb16ae62abd7834558c3a632d97f393c0f022972",
    token0Type: ADDRESSES.sui.USDC_CIRCLE,
    token1Type: ADDRESSES.sui.USDC
  },
  // usdc eth
  {
    poolID: "0xc04f71f32a65ddf9ebf6fb69f39261457da28918bfda5d3760013f3ea782a594",
    cetusPoolID: "0x9e59de50d9e5979fc03ac5bcacdb581c823dbd27d63a036131e17b391f2fac88",
    investorID: "0xb0bff60783536f9dc0b38e43150a73b73b8a4f1969446f7721e187821915bd00",
    token0Type: ADDRESSES.sui.USDC_CIRCLE,
    token1Type: "0xd0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e94f7f226d29::eth::ETH"
  },
  // deep sui
  {
    poolID: "0xff496f73a1f9bf7461882fbdad0c6c6c73d301d3137932f7fce2428244359eaa",
    cetusPoolID: "0xe01243f37f712ef87e556afb9b1d03d0fae13f96d324ec912daffc339dfdcbd2",
    investorID: "0x5e195363175e4b5139749d901ddd5ef1ffc751777a7051b558c45fa12f24abc3",
    token0Type: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
    token1Type: ADDRESSES.sui.SUI
  },
  // buck sui
  {
    poolID: "0xeb44ecef39cc7873de0c418311557c6b8a60a0af4f1fe1fecece85d5fbe02ab5",
    cetusPoolID: "0x59cf0d333464ad29443d92bfd2ddfd1f794c5830141a5ee4a815d1ef3395bf6c",
    investorID: "0x9b7c9b6086d3baf413bccdfbb6f60f04dedd5f5387dee531eef5b811afdfaedc",
    token0Type: ADDRESSES.sui.BUCK,
    token1Type: ADDRESSES.sui.SUI
  },
]

const ALPHAFI_NAVI_TVL_IDS = [
  {
    poolID: "0x643f84e0a33b19e2b511be46232610c6eb38e772931f582f019b8bbfb893ddb3",
    tokenType: ADDRESSES.sui.SUI,
    expo: 9
  },
  {
    poolID: "0x0d9598006d37077b4935400f6525d7f1070784e2d6f04765d76ae0a4880f7d0a",
    tokenType: "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT",
    expo: 9
  },
  {
    poolID: "0xc696ca5b8f21a1f8fcd62cff16bbe5a396a4bed6f67909cfec8269eb16e60757",
    tokenType: ADDRESSES.sui.USDT,
    expo: 6,
  },
  {
    poolID: "0x01493446093dfcdcfc6c16dc31ffe40ba9ac2e99a3f6c16a0d285bff861944ae",
    tokenType: ADDRESSES.sui.USDC,
    expo: 6
  },
  {
    poolID: "0xe4eef7d4d8cafa3ef90ea486ff7d1eec347718375e63f1f778005ae646439aad",
    tokenType: ADDRESSES.sui.WETH,
    expo: 8
  },
  {
    poolID: "0x04378cf67d21b41399dc0b6653a5f73f8d3a03cc7643463e47e8d378f8b0bdfa",
    tokenType: ADDRESSES.sui.USDC_CIRCLE,
    expo: 6
  },
  {
    poolID: "0xea3c2a2d29144bf8f22e412ca5e2954c5d3021d3259ff276e3b62424a624ad1f",
    tokenType: "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdy::USDY",
    expo: 6
  },
  {
    poolID: "0x8ebe04b51e8a272d4db107ad19cfbc184d1dafeeaab0b61c26e613b804e7777a",
    tokenType: "0x2053d08c1e2bd02791056171aab0fd12bd7cd7efad2ab8f6b9c8902f14df2ff2::ausd::AUSD",
    expo: 6
  },
  {
    poolID: "0xc37ec956fdef6c217505e62444ab93f833c20923755d67d1c8588c9b093ae00e",
    tokenType: "0xd0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e94f7f226d29::eth::ETH",
    expo: 8
  },
]
const ALPHAFI_NAVI_LOOP_TVL_IDS = [
  {
    poolID: "0xd013a1a0c6f2bad46045e3a1ba05932b4a32f15864021d7e0178d5c2fdcc85e3",
    investorID: "0x36cc3135c255632f9275a5b594145745f8344ce8f6e46d9991ffb17596195869",
    tokenType: "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT",
    expo: 9
  },
]
const ALPHAFI_BUCKET_TVL_IDS = [
  {
    poolID: "0x2c5c14b9fb21f93f36cac0f363acf59ecb21f34c4c9b1a1b383f635ecdc7b507",
    tokenType: ADDRESSES.sui.BUCK,
  },
  
]
const ALPHAFI_POOL2_IDS = [{
  poolID: "0x594f13b8f287003fd48e4264e7056e274b84709ada31e3657f00eeedc1547e37",
  cetusPoolID: "0xda7347c3192a27ddac32e659c9d9cbed6f8c9d1344e605c71c8886d7b787d720",
  investorID: "0x46d901d5e1dba34103038bd2ba789b775861ea0bf4d6566afd5029cf466a3d88",
  token0Type: "0xfe3afec26c59e874f3c1d60b8203cb3852d2bb2aa415df9548b8d688e6683f93::alpha::ALPHA",
  token1Type: ADDRESSES.sui.SUI
},
{
  poolID: "0x430986b53a787362e54fa83d0ae046a984fb4285a1bc4fb1335af985f4fe019d",
  cetusPoolID: "0x0cbe3e6bbac59a93e4d358279dff004c98b2b8da084729fabb9831b1c9f71db6",
  investorID: "0x705c560fd1f05c64e0480af05853e27e1c3d04e255cd6c5cb6921f5d1df12b5a",
  token0Type: "0xfe3afec26c59e874f3c1d60b8203cb3852d2bb2aa415df9548b8d688e6683f93::alpha::ALPHA",
  token1Type: ADDRESSES.sui.USDC
},
{
  poolID: "0x4c0e42f1826170ad9283b321a7f9a453ef9f65aaa626f7d9ee5837726664ecdc",
  cetusPoolID: "0x29e218b46e35b4cf8eedc7478b8795d2a9bcce9c61e11101b3a039ec93305126",
  investorID: "0xb43d1defd5f76ef084d68d6b56e903b54d0a3b01be8bb920ed1fa84b42c32ee1",
  token0Type: "0xfe3afec26c59e874f3c1d60b8203cb3852d2bb2aa415df9548b8d688e6683f93::alpha::ALPHA",
  token1Type: ADDRESSES.sui.USDC_CIRCLE
},
]

const ALPHA_POOL_ID = "0x6ee8f60226edf48772f81e5986994745dae249c2605a5b12de6602ef1b05b0c1"
const ALPHA_COIN_TYPE = "0xfe3afec26c59e874f3c1d60b8203cb3852d2bb2aa415df9548b8d688e6683f93::alpha::ALPHA"

function asIntN(int, bits = 32) {
  return Number(BigInt.asIntN(bits, BigInt(int)))
}

async function addPoolTVL(api, alphafiCetusPools) {
  for (const { poolID, cetusPoolID, investorID, token0Type, token1Type } of alphafiCetusPools) {
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

async function addPoolTVL2(api, alphafiNaviPools){
 
  for (const { poolID, tokenType, expo } of alphafiNaviPools){
    let poolObject = await sui.getObject(poolID);
    let tokensInvested = poolObject.fields.tokensInvested;
    let balance = BigInt(tokensInvested)/BigInt(Math.pow(10, 9-expo));
    api.add(tokenType, balance);
  }
}

async function addPoolTVL3(api, alphafiNaviLoopPools){
 
  for (const { poolID, investorID, tokenType, expo } of alphafiNaviLoopPools){
    let poolObject = await sui.getObject(poolID);
    let investorObject = await sui.getObject(investorID);
    let tokensInvested = poolObject.fields.tokensInvested;
    
    let liquidity = parseFloat(tokensInvested);
    /*
    in the code below, we are subtracting the debt in the pool from the liquidity, since the borrowed tokens are supplied back to the pool (as part of our strategy).
    we have current_debt_to_supply_ratio in the object, so current debt in the system is (current liquidity * current_debt_to_supply_ratio).
    we subtract the above derived debt from the liquidity.
    current_debt_to_supply_ratio in our system is scaled by 1e20, hence the division of 1e20 in the below used expression.
    */
    liquidity = liquidity*(1-(parseFloat(investorObject.fields.current_debt_to_supply_ratio)/parseFloat(1e20)));
    
    tokensInvested = (liquidity.toString().split('.')[0]);
    
    let balance = BigInt(tokensInvested)/BigInt(Math.pow(10, 9-expo));
    api.add(tokenType, balance);
  }
}

async function addPoolTVL4(api, alphafiBucketPools){
 
  for (const { poolID, tokenType } of alphafiBucketPools){
    let poolObject = await sui.getObject(poolID);
    let tokensInvested = poolObject.fields.tokensInvested;
    api.add(tokenType, tokensInvested);
  }
}

async function tvl(api) {
  
  await Promise.all([addPoolTVL(api, ALPHAFI_CETUS_TVL_IDS), addPoolTVL2(api, ALPHAFI_NAVI_TVL_IDS), addPoolTVL3(api, ALPHAFI_NAVI_LOOP_TVL_IDS), addPoolTVL4(api, ALPHAFI_BUCKET_TVL_IDS)])

}
async function pool2(api) {

  await addPoolTVL(api, ALPHAFI_POOL2_IDS)
  
}


async function staking(api) {
  let alphaPoolObject = await sui.getObject(ALPHA_POOL_ID)
  api.addToken(ALPHA_COIN_TYPE, BigInt(alphaPoolObject.fields.alpha_bal))
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  sui: {
    tvl, pool2, staking,
  },
}