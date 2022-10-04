/*==================================================
  Modules
  ==================================================*/
const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js')

const abi = require("./abi.json");
const IOTEX_CG_MAPPING = require("./iotex_cg_stablecoin_mapping.json")

/*==================================================
  Addresses
  ==================================================*/
const MINMAX_B3_POOL = '0x09A1B7d922BcfECa097b06498Bc992A83b0BCc42';
const MINMAX_E4_POOL = '0x89963FCD25Cd3b369A2e0642521BCA7Cf0B9d547';
const MINMAX_M3_POOL = '0xdab7B4D2CA330dde50ce611E2177271fD3Eb3F5F';
const MINMAX_USDT_POOL = '0x074ec23e80bd1fd26b822305614fb10b97847a35';
const MINMAX_XIM_B3_POOL = '0xe409587F043f74e47eFB0C10aAf40808D4e037cE';
const MINMAX_XIM_M3_POOL = '0x73541e9ffb9F4B8d13C2E5621b1Cede1981aD0d9';
const MINMAX_XIM_E3_POOL = '0x2c1B1DE747043f7C7c8e0896EB33b09eD9ED55c5';
const MINMAX_E3_POOL = '0xC264ED05ed2aF451732EF05C480d9e51b92a07aC';
const MINMAX_XIM_E3_METAPOOL = '0x8360D306Be83f9A992b1657Ad68fe08Ca6f2757A';
const MINMAX_XIM_B3_METAPOOL = '0x833d89FA7dD693035678AB53Be792F6F4B352C01';
const MINMAX_XIM_M3_METAPOOL = '0x7B24cAA6a497bc79FDfBAeb8A71a38F15eB3d7F7';

const tokens = {
  // BUSD
  '0xacee9b11cd4b3f57e58880277ac72c8c41abe4e4':[MINMAX_E4_POOL, MINMAX_XIM_E3_POOL], // decimal: 18
  // USDC
  '0x3B2bf2b523f54C4E454F08Aa286D03115aFF326c':[MINMAX_E4_POOL, MINMAX_XIM_E3_POOL, MINMAX_E3_POOL, MINMAX_XIM_E3_METAPOOL], // decimal: 6
  // USDT
  '0x6fbCdc1169B5130C59E72E51Ed68A84841C98cd1':[MINMAX_E4_POOL, MINMAX_USDT_POOL, MINMAX_XIM_E3_POOL, MINMAX_E3_POOL, MINMAX_XIM_E3_METAPOOL], // decimal: 6
  // DAI
  '0x1CbAd85Aa66Ff3C12dc84C5881886EEB29C1bb9b':[MINMAX_E4_POOL, MINMAX_E3_POOL, MINMAX_XIM_E3_METAPOOL], // decimal: 18
  // BUSD_b
  '0x84abcb2832be606341a50128aeb1db43aa017449':[MINMAX_B3_POOL, MINMAX_XIM_B3_POOL, MINMAX_XIM_B3_METAPOOL], // decimal: 18
  // USDC_b
  '0x037346E5a5722957Ac2cAb6ceb8c74fC18Cea91D':[MINMAX_B3_POOL, MINMAX_XIM_B3_POOL, MINMAX_XIM_B3_METAPOOL], // decimal: 18
  // USDT_b
  '0x42C9255D5e522e83B16ea11a3BA04c2D3AfCA079':[MINMAX_B3_POOL, MINMAX_USDT_POOL, MINMAX_XIM_B3_POOL, MINMAX_XIM_B3_METAPOOL], // decimal: 18
  // DAI_m
  '0x62a9d987cbf4c45a550deed5b57b200d7a319632':[MINMAX_M3_POOL, MINMAX_XIM_M3_POOL, MINMAX_XIM_M3_METAPOOL], // decimal: 18
  // USDT_m
  '0x3cdb7c48e70b854ed2fa392e21687501d84b3afc':[MINMAX_M3_POOL, MINMAX_USDT_POOL, MINMAX_XIM_M3_POOL, MINMAX_XIM_M3_METAPOOL], // decimal: 6
  // USDC_m
  '0xc04da3a99d17135857bb937d2fbb321d3b6c6a81':[MINMAX_M3_POOL, MINMAX_XIM_M3_POOL, MINMAX_XIM_M3_METAPOOL], // decimal: 6
  // XIM
  '0xec690cdd448e3cbb51ed135df72301c3265a8f80': [MINMAX_XIM_B3_POOL, MINMAX_XIM_M3_POOL, MINMAX_XIM_E3_POOL, MINMAX_XIM_E3_METAPOOL, MINMAX_XIM_B3_METAPOOL, MINMAX_XIM_M3_METAPOOL] // decimal: 6
};

const lpTokens = {
  //MAX-XIM
  '0xDE7399eC841627bc68243832572086B9d2D41404': ['0xce5E67333E3E52860b8F2E5f02a7B9EdaA67f932'],
  // minmaxB3
  '0xC35257624b01932e521bc5D9dc07e4F9ed21ED28': ['0x7bCA7698F35FC04f4217059BfD7bA73062560204'],
  // minmaxM3
  '0xdFf5DC9d8dAC189324452D54e2df19d2Bdba78CE': ['0x2700f28B7B97a0881410D2eA688ee455713e87D4'],
  // minmaxE3
  '0xa546b5769f3F97F93Fc90F63Fbe7423250216b98': ['0x64D19dA38ca28ACbaE62c4B9143f5d867B593504'],
  // minmaxXIMB3Meta
  '0x834D27A61c7fE4F52Ad5435e59e85D64aA1375a7': ['0x3267E70dB372E42b25e79a5E35f3aED202cDe642'],
  // minmaxXIMM3Meta
  '0x69d9EAbd5b3f967BbaE9fF9b73e4dA3Ba0c46D08': ['0xB040FF8F8F5F2399c67c2cCBa8A7cc6777435306'],
  // minmaxXIME3Meta
  '0x89a7663c4ca176ACD8E6a054da67B0d301FC218A': ['0xE9E6CdDB08042f35e0ADAf62Ad0559b0F17E7e1c'],
  // minmaxXIMB3
  '0xd33f8a41e2ec9ff64fdc008e00f69f0e142948ad': ['0xce5E67333E3E52860b8F2E5f02a7B9EdaA67f932'],
  // minmaxXIME3
  '0xb581afb9c7aa567edbe6274bddc975b7926edaaf': ['0xce5E67333E3E52860b8F2E5f02a7B9EdaA67f932'],
  // minmaxXIMM3
  '0xf79fd0a6d1d8ce877fc70acd321fdf1626168398': ['0xce5E67333E3E52860b8F2E5f02a7B9EdaA67f932']
};

/*==================================================
  Helper
  ==================================================*/

function compareAddresses(a, b){
    return a.toLowerCase() === b.toLowerCase()
}

function transformIotexAddress(addr) {
    const dstToken = Object.keys(IOTEX_CG_MAPPING).find(token => compareAddresses(addr, token))
    if (dstToken !== undefined) {
        return IOTEX_CG_MAPPING[dstToken].contract || IOTEX_CG_MAPPING[dstToken].coingeckoId
    }
    return `iotex:${addr}`, 0; 
}

/*==================================================
  TVL
  ==================================================*/

async function tvl(block) {
  let balances = {};
  let calls = [];

  for (const token in tokens) {
    for(const poolAddress of tokens[token])
    calls.push({
      target: token,
      params: poolAddress
    })
  }

  // Pool Balances
  let balanceOfResults = await sdk.api.abi.multiCall({
    block,
    calls: calls,
    abi: 'erc20:balanceOf',
    chain: 'iotex'
  });

  // Compute Balances
  balanceOfResults.output.forEach((balanceOf) => {
      let address = balanceOf.input.target
      let amount =  balanceOf.output

      // align decimal from 6 to 18: USDC, USDT, USDT_m, USDC_m
      if (address == '0x3B2bf2b523f54C4E454F08Aa286D03115aFF326c' 
        || address == '0x6fbCdc1169B5130C59E72E51Ed68A84841C98cd1' 
        || address == '0x3cdb7c48e70b854ed2fa392e21687501d84b3afc' 
        || address == '0xc04da3a99d17135857bb937d2fbb321d3b6c6a81') {
          amount = amount * 1e12
      }
      address  = transformIotexAddress(address);

      balances[address] = BigNumber(balances[address]|| 0).plus(amount).toFixed()

  });

  // fix balance: usdc-coin, tether
  for(const representation of ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0xdac17f958d2ee523a2206206994597c13d831ec7']){
    if(balances[representation] !== undefined){
        balances[representation] = Number(balances[representation]) / 1e12
    }
  }

  let lpCalls = [];

  for (const lpToken in lpTokens) {
    for(const poolAddress of lpTokens[lpToken])
    lpCalls.push({
      target: lpToken,
      params: poolAddress
    })
  }

  // Farm balance
  let lpBalanceOfResults = await sdk.api.abi.multiCall({
    block,
    calls: lpCalls,
    abi: 'erc20:balanceOf',
    chain: 'iotex'
  });

  // Compute Balances
  lpBalanceOfResults.output.forEach((balanceOf) => {
      let address = balanceOf.input.target
      let amount =  balanceOf.output

      address  = transformIotexAddress(address);
      balances[address] = BigNumber(balances[address]|| 0).plus(amount).toFixed()

  });

  return balances;
}

module.exports = {
  timetravel: true,
  methodology: "All the assets in the pool.",
  iotex:{
    tvl,
  },
};


