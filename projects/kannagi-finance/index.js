const sdk = require('@defillama/sdk');
const abi = require("./abi.json");
const {getCoreAssets,normalizeAddress} = require('../helper/tokenMapping');
const {getChainTransform} = require('../helper/portedTokens');
const { default: BigNumber } = require('bignumber.js');

const WETH_ADDRESS ="0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91";
const ETH_ASSET = "0x000000000000000000000000000000000000800A";
const LP_KANA_ADDRESS='0xBD5126537704725a20B3Fa79AB73f218f81a40a8';
const KANA_ADDRESS = "0x26aC1D9945f65392B8E4E6b895969b5c01A7B414";
const YIELD_ADDRESS= "0x6E415ba5a37761256D13E84B45f4822c179DEF47";

async function tvlSingle(balances,tvlPools,transform){
  tvlPools.forEach(tvlPool => {
    if(tvlPool.lpToken === ETH_ASSET){
      tvlPool.lpToken = WETH_ADDRESS;
    }
    sdk.util.sumSingleBalance(balances,transform(tvlPool.lpToken),tvlPool.tvl);
  });
}


async function tvlLp(balances,tvlPools,transform,chain){
  const coreTokens = new Set(getCoreAssets(chain));
  const calls = tvlPools.map(tvlpool=>({target:tvlpool.lpToken,params:[]}));

  const {output:totalSupplys} = await sdk.api.abi.multiCall({ abi:abi.totalSupply,calls,chain});
  const {output:reserves} = await sdk.api.abi.multiCall({ abi:abi.reserves,calls,chain});
  const {output:token0s} = await sdk.api.abi.multiCall({ abi:abi.token0,calls,chain});
  const {output:token1s} =  await sdk.api.abi.multiCall({ abi:abi.token1,calls,chain});

  for (let index = 0; index < tvlPools.length; index++) {
    const tvlPool = tvlPools[index];
    const token0 = normalizeAddress(token0s[index].output,chain)
    const token1 = normalizeAddress(token1s[index].output,chain)

    const ratio = tvlPool.tvl / totalSupplys[index].output;
    const isCoreToken1 = coreTokens.has(token1);
    const reserve = reserves[index].output
   if(isCoreToken1){
      sdk.util.sumSingleBalance(balances,transform(token1),BigNumber(reserve[1]).times(ratio).times(2).toFixed(0));
    } else {
      sdk.util.sumSingleBalance(balances,transform(token0),BigNumber(reserve[0]).times(ratio).times(2).toFixed(0));
    }
  }
}

async function tvlKana(balances,tvlPool,transform,chain){
  const {output:reserve} = await sdk.api.abi.call({ target:LP_KANA_ADDRESS,abi:abi.reserves,params:[],chain});
  let {output:token0} = await sdk.api.abi.call({ target:LP_KANA_ADDRESS,abi:abi.token0,params:[],chain});
  let {output:token1} =  await sdk.api.abi.call({ target:LP_KANA_ADDRESS,abi:abi.token1,params:[],chain});

  const usdcReserve = KANA_ADDRESS === token0?reserve[1]:reserve[0];
  const kanaReserve = KANA_ADDRESS === token0?reserve[0]:reserve[1];

  const r = tvlPool.tvl/kanaReserve * usdcReserve;
  const usdcAddr = KANA_ADDRESS === token0?token1:token0;
  sdk.util.sumSingleBalance(balances,transform(usdcAddr),r);
}


async function tvl(timestamp, ethBlock, chainBlocks, {chain}) {

  const transform = await getChainTransform(chain)
  const {output:poolTvlInfo} = await sdk.api.abi.call({abi:abi.poolTvlInfo,target: YIELD_ADDRESS,params: [],chain});

  const balances = {};
  await tvlSingle(balances,poolTvlInfo.slice(0,2),transform);
  await tvlLp(balances,poolTvlInfo.slice(3),transform,chain);
  await tvlKana(balances,poolTvlInfo[2],transform,chain);

  return balances;
}

module.exports = {
  era: {
    tvl,
  },
};
