const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const getReserves = require('./abis/uniswap/getReserves.json');
const token0 = require('./abis/uniswap/token0.json');
const token1 = require('./abis/uniswap/token1.json');

const numTokensWrapped = require('./abis/erc95/numTokensWrapped.json');
const getTokenInfo = require('./abis/erc95/getTokenInfo.json');

const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

// cVault UniV2 pairs
const CORE_WETH_V2 =    '0x32Ce7e48debdccbFE0CD037Cc89526E4382cb81b' // CORE/WETH - LP1
const CORE_CBTC_V2 =   '0x6fad7D44640c5cd0120DEeC0301e8cf850BecB68' // CORE/cBTC - LP2
const COREDAI_WCORE_V2 =   '0x01AC08E821185b6d87E68c67F9dc79A8988688EB' // coreDAI/wCORE - LP3 
const CORE_FANNY_V2 =   '0x85d9dcce9ea06c2621795889be650a8c3ad844bb' // CORE/FANNY

// Delta Sushi Pairs
const DELTA_ETH_SSLP =  '0x1498bd576454159bb81b5ce532692a8752d163e8' // DELTA/ETH - sushiLP

// ERC95 Tokens
const COREBTC =    '0x7b5982dcAB054C377517759d0D2a3a5D02615AB8' // cBTC
const COREDAI =   '0x00a66189143279b6DB9b77294688F47959F37642' // coreDAI
const WCORE   =    '0x17B8c1A92B66b1CF3092C5d223Cb3a129023b669' // wCORE

// ERC20 Tokens
const COREDAO =    '0xf66cd2f8755a21d3c8683a10269f795c0532dd58' // coreDAO
const DAI   =      '0x6B175474E89094C44Da98b954EedeAC495271d0F' // DAI
const DELTA =      '0x9EA3b5b4EC044b70375236A281986106457b20EF' // DELTA
const FANNY =       '0x8ad66f7e0e3e3dc331d3dbf2c662d7ae293c1fe0' // FANNY
const CORE = '0x62359ed7505efc61ff1d56fef82158ccaffa23d7' // CORE
const DELTA_RLP =      '0xfcfc434ee5bff924222e084a8876eee74ea7cfba' // DELTA rLP       
const WETH =       '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // wETH

// Ecosystem contracts
const CORE_DEPLOYER      = '0x5a16552f59ea34e44ec81e58b3817833e9fd5436' // CoreVault Deployer/Multisig
const CORE_VAULT_PROXY   = '0xc5cacb708425961594b63ec171f4df27a9c0d8c9' // 
const CORE_LGE_2         = '0xf7ca8f55c54cbb6d0965bc6d65c43adc500bc591' // CORE LGE 2
const CLEND = '0x54B276C8a484eBF2a244D933AF5FFaf595ea58c5' // cLEND
const LP_WRAPPER         = '0xe508a37101fce81ab412626ee5f1a648244380de' // LP Migration Wrapper
const FANNY_VAULT        = '0xbb791bc6106e4d949863e2ab76fc01ac0a9d7816' // Fanny Vault
const DELTA_DFV          = '0x9fe9bb6b66958f2271c4b0ad23f6e8dda8c221be' // Delta Deep Farming Vault
const DELTA_STABLE_YIELD = '0x3554fc4998f83967dcab5b2ef858e8e63fefbd26' // Delta StableYield
const DELTA_LSW          = '0xdaFCE5670d3F67da9A3A44FE6bc36992e5E2beaB' // Delta LSW
const DELTA_DISTRIBUTOR  = '0xF249C5B422758D91d8f05E1Cc5FC85CF4B667461' // Delta Distributor
const DELTA_MULTISIG     = '0xB2d834dd31816993EF53507Eb1325430e67beefa' // Delta Multisig

const zero = new BigNumber(0);

const configs = {
  
  // [address,isLP]
  assets: [
      [DAI, false],
      [DELTA, false],
      [CORE, false],
      [COREDAO, false],
      [DELTA_RLP, false],
      [FANNY, false],
      [WETH, false], 
      [COREBTC, false],
      [COREDAI, false],
      [WCORE, false],
      [FANNY, false],
      [DELTA_ETH_SSLP, true],
      [CORE_WETH_V2, true],
      [CORE_CBTC_V2, true],
      [COREDAI_WCORE_V2,true],
      [CORE_FANNY_V2, true],
    ] ,
  pairAddresses: [CORE_WETH_V2, CORE_CBTC_V2, COREDAI_WCORE_V2]
  ,
  erc95TokenAddresses: [COREBTC, COREDAI, WCORE]
  ,  
  staking: [CORE_VAULT_PROXY, DELTA_DFV, FANNY_VAULT, DELTA_STABLE_YIELD]
  ,
  lending: [CLEND]
  ,
  treasury: [CORE_DEPLOYER, CORE_LGE_2, LP_WRAPPER, DELTA_LSW, DELTA_DISTRIBUTOR, DELTA_MULTISIG]
}

/**
 * Retrieve all the Uniswap pair information.
 * 
 * @param {[String]} pairAddresses The uniswap pair addresses
 * @param {any} timestamp 
 * @param {any} block 
 * @returns {Promise<[{ token0: String,  token1: String, reserve0: String, reserve1: String }]>}
 */
async function getUniswapPairInfo(pairAddresses, timestamp, block) {
  const [token0Addresses, token1Addresses, reserves, totalSupplies] = await Promise.all([
    sdk.api.abi.multiCall({
      abi: token0,
      calls: pairAddresses.map((pairAddress) => ({
        target: pairAddress,
      })),
      block,
    })
      .then(({ output }) => output.map(value => value.output)),
    sdk.api.abi.multiCall({
      abi: token1,
      calls: pairAddresses.map((pairAddress) => ({
        target: pairAddress,
      })),
      block,
    })
      .then(({ output }) => output.map(value => value.output)),
    sdk.api.abi.multiCall({
      abi: getReserves,
      calls: pairAddresses.map((pairAddress) => ({
        target: pairAddress,
      })),
      block,
    })
      .then(({ output }) => output.map(value => value.output)),
    sdk.api.abi.multiCall({
      block,
      calls: pairAddresses.map(pairAddress => ({
        target: pairAddress
      })),
      abi: 'erc20:totalSupply',
    }).then(({ output }) => output.map(value => value.output))
  ]);
  return pairAddresses.map((_value, index) => {
    return {
      reserve0: reserves[index] ? reserves[index]['reserve0'] : null,
      reserve1: reserves[index] ? reserves[index]['reserve1'] : null,
      token0: token0Addresses[index],
      token1: token1Addresses[index],
      totalSupply: totalSupplies[index],
    }
  })
}

/**
 * Retrieve the underlying reserve of each token within a pair.
 * 
 * @param {{ token0: String, token1: String, reserve0: String, reserve1: String }} pairInfo Contains the information about a pair.
 * @param {any} timestamp 
 * @param {any} block
 * @returns {Promise<{ [String]: BigNumber }>}
 */
async function getPairUnderlyingReserves(pairInfo, timestamp, block) {
  return Promise.all([
    getTokenUnderlyingReserves(pairInfo.token0, pairInfo.reserve0, timestamp, block),
    getTokenUnderlyingReserves(pairInfo.token1, pairInfo.reserve1, timestamp, block)
  ]);
};

/**
 * Retrieve the token reserve and if it's an ERC95 token, retrieve
 * each underlying assets reserves.
 * 
 * @param {String} token Token address
 * @param {String} defaultReserve Default reserve amount to use when not a ERC95 token
 * @param {any} timestamp 
 * @param {any} block
 * @returns {Promise<{ [String]: BigNumber }>}
 */
async function getTokenUnderlyingReserves(token, defaultReserve, _timestamp, block) {
  if (configs.erc95TokenAddresses.indexOf(token) === -1) {
    return [{ [token]: defaultReserve }];
  }

  const numTokensWrappedResponse = await sdk.api.abi.call({
    target: token,
    abi: numTokensWrapped,
    block
  });

  const wrappedTokenCount = parseInt(numTokensWrappedResponse.output);
  const getTokenInfoCalls = []
  for (let i = 0;i < wrappedTokenCount; i++)
    getTokenInfoCalls.push({
      target: token,
      params: [i],
      abi: getTokenInfo,
      block
    })

  const tokenInfoResponse = await sdk.api.abi.multiCall({
    block,
    calls: getTokenInfoCalls,
    abi: getTokenInfo,
  });

  const reserves = tokenInfoResponse.output.map(info => ({
    [info.output.address]: info.output.reserve
  }));

  return reserves;
};

/**
 * Flatten and merge common underlying assets with their reserve sum.
 *
 * @param {[{[String]: BigNumber}]} underlyingReserves 
 * @returns {{[String]: [String]}} An object of the token address and its reserve.
 */
function flattenUnderlyingReserves(underlyingReserves) {
  const reserves = {};

  underlyingReserves.forEach(pairReserves => {
    pairReserves.forEach(tokenReserves => {
      tokenReserves.forEach(underlyingReserves => {
        Object.keys(underlyingReserves).forEach(address => {
          const tokenReserve = new BigNumber(underlyingReserves[address]);
          reserves[address] = (reserves[address] || zero).plus(tokenReserve);
        });
      });
    });
  });

  Object.keys(reserves).forEach(address => {
    reserves[address] = reserves[address].toFixed();
  });

  return reserves;
}

const merge = data => {
    const result = {};
    data.forEach(obj => {
        for (let [key, value] of Object.entries(obj)) {
            
            if (result[key]) {
                result[key] = BigNumber(result[key]).plus(value).toFixed(0);
            } else {
                result[key] = value;
            }
        }
    });
    return result;
};
    
async function  tvl(timestamp, block)
{

    const pairInfo = await getUniswapPairInfo(configs.pairAddresses, timestamp, block);
    const underlyingReserves = await Promise.all(pairInfo.map(info => getPairUnderlyingReserves(info, timestamp, block)));
    const balances_erc90 = flattenUnderlyingReserves(underlyingReserves);
  
    console.log(balances_erc90)
  
    const balances_treasure = {};
    await Promise.all(configs.treasury.map(address => sumTokensAndLPsSharedOwners(
    balances_treasure,
    configs.assets,
    [address],
    block
    )));  
    
    console.log(balances_treasure)

    const balances_borrow = {};
    await Promise.all(configs.lending.map(address => sumTokensAndLPsSharedOwners(
    balances_borrow,
    configs.assets,
    [address],
    block
    )));
  
    console.log(balances_borrow)
  
    const balances_staking = {};
    await Promise.all(configs.staking.map(address => sumTokensAndLPsSharedOwners(
    balances_staking,
    configs.assets,
    [address],
    block
    )));  
    
    console.log(balances_staking)
    
    balances_cat = [balances_erc90, balances_treasure, balances_borrow, balances_staking];

    const balances = merge(balances_cat) 

    console.log(balances)
    return balances
}

async function treasury(timestamp, block)
{
    const balances = {};
    await Promise.all(configs.treasury.map(address => sumTokensAndLPsSharedOwners(
    balances,
    configs.assets,
    [address],
    block
  )));

  return balances;
    
}

async function borrowed(timestamp, block)
{
    const balances = {};
    await Promise.all(configs.lending.map(address => sumTokensAndLPsSharedOwners(
    balances,
    configs.assets,
    [address],
    block
  )));
 
  return balances;
    
}

async function staking(timestamp, block)
{
    const balances = {};
    await Promise.all(configs.staking.map(address => sumTokensAndLPsSharedOwners(
    balances,
    configs.assets,
    [address],
    block
  )));

  return balances;
    
}

module.exports = {
  ethereum: 
  {
      start: 1601142406, // 2020-09-26 17:46:46 (UTC),
      tvl, 
      treasury, 
      borrowed, 
      staking,
      ownTokens: ['CORE', 'CoreDAO', 'Delta', 'FANNY', 'Delta rLP', 'cBTC', 'cDAI']
  }
};
