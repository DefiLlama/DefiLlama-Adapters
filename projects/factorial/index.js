const { sumTokens, call } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

const market_main = "EQCrEHHG4Ff8TD3PzuH5tFSwHBD3zxeXaosz48jGLebwiiNx"

async function tvl(api) { 
  await sumTokens({
    api,
    owners: [market_main],
    tokens: [ADDRESSES.null],
  });
    
  const result = await call({ target: market_main, abi: "get_pool_data" })

  const _kv = 1;
  const assetDicIdx = 13;
  const tonIdx = 2;
  const amountIdx = 4;
  const assets = result[assetDicIdx][_kv]["elements"];
  const amount = assets[tonIdx]["tuple"]["elements"][amountIdx];
  const basicPoolTonAmount = amount["number"]["number"];

  api.add(ADDRESSES.ton.TON, basicPoolTonAmount);
 }

module.exports = {
  methodology: 'Total amount of assets locked in Factorial pool',
  ton: {
    tvl: tvl
  }
}


