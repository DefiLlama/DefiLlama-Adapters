/*==================================================
  Modules
  ==================================================*/
const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js')
const _ = require('underscore');
const IOTEX_CG_MAPPING = require("./iotex_cg_stablecoin_mapping.json")

/*==================================================
  Addresses
  ==================================================*/
const MINMAX_B3_POOL = '0x09A1B7d922BcfECa097b06498Bc992A83b0BCc42';
const MINMAX_E4_POOL = '0x89963FCD25Cd3b369A2e0642521BCA7Cf0B9d547';
const MINMAX_M3_POOL = '0xdab7B4D2CA330dde50ce611E2177271fD3Eb3F5F';
const MINMAX_USDT_POOL = '0x074ec23e80bd1fd26b822305614fb10b97847a35';
const tokens = {
  // BUSD
  '0xacee9b11cd4b3f57e58880277ac72c8c41abe4e4':[MINMAX_E4_POOL], // decimal: 18
  // USDC
  '0x3B2bf2b523f54C4E454F08Aa286D03115aFF326c':[MINMAX_E4_POOL], // decimal: 6
  // USDT
  '0x6fbCdc1169B5130C59E72E51Ed68A84841C98cd1':[MINMAX_E4_POOL, MINMAX_USDT_POOL], // decimal: 6
  // DAI
  '0x1CbAd85Aa66Ff3C12dc84C5881886EEB29C1bb9b':[MINMAX_E4_POOL], // decimal: 18
  // BUSD_b
  '0x84abcb2832be606341a50128aeb1db43aa017449':[MINMAX_B3_POOL], // decimal: 18
  // USDC_b
  '0x037346E5a5722957Ac2cAb6ceb8c74fC18Cea91D':[MINMAX_B3_POOL], // decimal: 18
  // USDT_b
  '0x42C9255D5e522e83B16ea11a3BA04c2D3AfCA079':[MINMAX_B3_POOL, MINMAX_USDT_POOL], // decimal: 18
  // DAI_m
  '0x62a9d987cbf4c45a550deed5b57b200d7a319632':[MINMAX_M3_POOL], // decimal: 18
  // USDT_m
  '0x3cdb7c48e70b854ed2fa392e21687501d84b3afc':[MINMAX_M3_POOL, MINMAX_USDT_POOL], // decimal: 6
  // USDC_m
  '0xc04da3a99d17135857bb937d2fbb321d3b6c6a81':[MINMAX_M3_POOL] // decimal: 6
}

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
  _.each(balanceOfResults.output, (balanceOf) => {
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

  return balances;
}

module.exports = {
  iotex:{
    tvl,
  },
  tvl,
};


