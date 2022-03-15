const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const { pools } = require("./cronos/pools");
const { vaults } = require("./cronos/vaults");
const { farms, WMASTERCHEF_ADDR } = require("./cronos/farms");

const abi = require("./abi.json");

function compareAddresses(a, b) {
  return a.toLowerCase() === b.toLowerCase();
}


const TEN = new BigNumber(10);

const tokenDecimals = {
  'shiba-inu': 18,//SHIBA
  'dogecoin': 8,//DOGE
  'cosmos-hub': 6,//ATOM
  'dogelon-mars': 18//ELON
}

const transformCronosAddr = (addr) => {

  if(compareAddresses(addr, '0xbED48612BC69fA1CaB67052b42a95FB30C1bcFee')){
    return 'shiba-inu'
  }
  if(compareAddresses(addr, '0x1a8E39ae59e5556B56b76fCBA98d22c9ae557396')){
    return 'dogecoin'
  }
  if(compareAddresses(addr, '0xB888d8Dd1733d72681b30c00ee76BDE93ae7aa93')){
    return 'cosmos-hub'
  }
  if(compareAddresses(addr, '0x02DCcaf514C98451320a9365C5b46C61d3246ff3')){
    return 'dogelon-mars'
  }

  return `cronos:${addr}`;
};

const transformBalance = (bal, tokenKey) => {
  if(tokenDecimals[tokenKey]){
    return (new BigNumber(bal)).div(TEN.pow(tokenDecimals[tokenKey])).toFixed(0);
  }else{
    return bal
  }
}


async function cronos_staking(timestamp, block, chainBlocks)
{

  let balances = {};

  for (const pool of pools)
  {

    if(chainBlocks['cronos'] < pool.sinceBlock){
      continue;
    }

    let lockedTokenBalance = ((await sdk.api.abi.call({
        chain: 'cronos',
        block: chainBlocks['cronos'],
        target: pool.tokenContract,
        abi: 'erc20:balanceOf',
        params: pool.address
    })).output);

    if(!pool.isLP)
    {
      
      sdk.util.sumSingleBalance(
        balances,
        transformCronosAddr(pool.tokenContract),
        lockedTokenBalance
      );

    }else{

      await unwrapUniswapLPs(
          balances,
          [{balance: lockedTokenBalance, token: pool.tokenContract}],
          chainBlocks['cronos'],
          'cronos',
          transformCronosAddr
      );

    }
  }

  return balances;
}




async function cronos_lending(timestamp, block, chainBlocks)
{

  // get list of vault
  let balances = {};

  for (const vault of vaults)
  {
    if(chainBlocks['cronos'] < vault.sinceBlock){
      continue;
    }

    let lendingPoolTokenBalance = ((await sdk.api.abi.call({
        chain: 'cronos',
        block: chainBlocks['cronos'],
        target: vault.token,
        abi: 'erc20:balanceOf',
        params: vault.address
    })).output);

    sdk.util.sumSingleBalance(
      balances,
      transformCronosAddr(vault.token),
      lendingPoolTokenBalance
    );
  }

  return balances;
}


/**
 * All Cronos Farming positions
 */
async function cronos_farm(timestamp, block, chainBlocks)
{
  let balances = {};

  await Promise.all(farms.map(async (farm, idx) => {

    if(chainBlocks['cronos'] < farm.sinceBlock){
      return;
    }

    let userInfo = (await sdk.api.abi.call({
      chain: 'cronos',
      block: chainBlocks['cronos'],
      abi: abi.userInfo,
      target: farm.masterChef,
      params: [farm.masterchefPoolId, WMASTERCHEF_ADDR]
    })).output;

    let balance = userInfo.amount.toString();

    await unwrapUniswapLPs(
        balances,
        [{balance: balance, token: farm.lpToken}],
        chainBlocks['cronos'],
        'cronos',
        transformCronosAddr
    );

  }));

  // console.log("cronos_farm balances = ", balances);
  return balances;
}





async function cronos_tvl(timestamp, block, chainBlocks){
  //locked staking
  //lending available tokens
  //strategy + lyf farms

  let balances = {}

  const [
    stakingBalances,
    lendingBalances,
    farmingBalances,
  ] = await Promise.all([
    cronos_staking(timestamp, block, chainBlocks),
    cronos_lending(timestamp, block, chainBlocks),
    cronos_farm(timestamp, block, chainBlocks)
  ]);

  Object.keys(stakingBalances).map((t) => sdk.util.sumSingleBalance(balances, t, stakingBalances[t]));
  Object.keys(lendingBalances).map((t) => sdk.util.sumSingleBalance(balances, t, lendingBalances[t]));
  Object.keys(farmingBalances).map((t) => sdk.util.sumSingleBalance(balances, t, farmingBalances[t]));

  // div by 10 ** <token decimals>
  Object.keys(balances).map((tokenKey) => {
    balances[tokenKey] = transformBalance(balances[tokenKey], tokenKey);
  })

  return balances;
}



// https://docs.llama.fi/list-your-project/how-to-write-an-sdk-adapter
module.exports = {
  name: "Single Finance",
  token: "SINGLE",
  start: 1643186078,

  // if we can backfill data with your adapter. Most SDK adapters will allow this, but not all. For example, if you fetch a list of live contracts from an API before querying data on-chain, timetravel should be 'false'.
  timetravel: true,
  //if you have used token substitutions at any point in the adapter this should be 'true'.
  misrepresentedTokens: true,

  cronos: {
    tvl: cronos_tvl,
  },


};
