const ADDRESSES = require('../helper/coreAssets.json')
/*==================================================
  Modules
  ==================================================*/


const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const BigNumber = require('bignumber.js');
const { getLogs } = require('../helper/cache/getLogs')

/*==================================================
Settings
==================================================*/

const wETH = ADDRESSES.ethereum.WETH;
const usdt = ADDRESSES.ethereum.USDT;
const yyCrv = '0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c';
const yETH = '0xe1237aA7f535b0CC33Fd973D66cBf830354D16c7';
const crYFI = '0xCbaE0A83f4f9926997c8339545fb8eE32eDc6b76';
const crCREAM = '0x892B14321a4FCba80669aE30Bd0cd99a7ECF6aC0';
const cryUSD = '0x4EE15f44c6F0d8d1136c83EfD2e8E4AC768954c6';
const CRETH2 = '0xcBc1065255cBc3aB41a6868c22d1f1C573AB89fd';

/*==================================================
  TVL
  ==================================================*/

function isCrToken(address) {
  const crTokens = [crYFI, crCREAM, cryUSD];
  return crTokens.includes(address);
}

async function tvl(api) {
  const block = api.block
  let balances = {
    [ADDRESSES.null]: '0', // ETH
  };

  let poolLogs = (await Promise.all([
    getLogs({
      api,
      target: '0xf8062Eedf80D8D2527cE89435f670cb996aB4e54',
      topic: 'LOG_NEW_POOL(address,address)',
      fromBlock: 10815298,
    }),

    block >= 11053389 ?
      getLogs({
        api,
        target: '0x136d6F80Bb3A853D151686BFED2c9309Aea6dDec',
        topic: 'LOG_NEW_POOL(address,address)',
        fromBlock: 11053389,
      }) : Promise.resolve( []),

    block >= 11099537 ?
      getLogs({
        api,
        target: '0x0d3303Ffaf107cD732396570Bf07b2dbd79B619f',
        topic: 'LOG_NEW_POOL(address,address)',
        fromBlock: 11099537,
      }) : Promise.resolve([])
  ])).reduce((pools, subPools) => {
    pools.push(...subPools);
    return pools;
  }, [])

  let poolCalls = [];

  let pools = poolLogs.map((poolLog) => {
    return `0x${poolLog.topics[2].slice(26)}`
  });

  const poolTokenData = (await sdk.api.abi.multiCall({
    calls: pools.map((poolAddress) => ({ target: poolAddress })),
    abi: abi.getCurrentTokens,
  })).output;

  poolTokenData.forEach((poolToken) => {
    let poolTokens = poolToken.output;
    let poolAddress = poolToken.input.target;

    poolTokens.forEach((token) => {
      poolCalls.push({
        target: token,
        params: poolAddress,
      });
    })
  });

  let poolBalances = (await sdk.api.abi.multiCall({
    block,
    calls: poolCalls,
    abi: 'erc20:balanceOf'
  })).output;

  poolBalances.forEach((balanceOf) => {
    let balance = balanceOf.output;
    let address = balanceOf.input.target;

    if (BigNumber(balance).toNumber() <= 0) {
      return;
    }

    balances[address] = BigNumber(balances[address] || 0).plus(balance).toFixed();
  });

  let underlyingBalanceCalls = [];
  let underlyingAddressCalls = [];
  poolBalances.filter((poolBalance) => isCrToken(poolBalance.input.target)).forEach(pooBalance => {
    underlyingBalanceCalls.push({
      target: pooBalance.input.target,
      params: pooBalance.input.params,
    });
    underlyingAddressCalls.push({
      target: pooBalance.input.target,
      params: [],
    })
  })

  let [underlyingBalances, underlyingAddress, yVaultPrices, yCrvPrice] = await Promise.all([
    sdk.api.abi.multiCall({
      block,
      calls: underlyingBalanceCalls,
      abi: abi['balanceOfUnderlying'],
      permitFailure: true,
    }),
    sdk.api.abi.multiCall({
      block,
      calls: underlyingAddressCalls,
      abi: abi['underlying']
    }),
    sdk.api.abi.multiCall({
      block,
      calls: [{ target: yETH }, { target: yyCrv }],
      abi: abi['getPricePerFullShare'],
    }),
    sdk.api.abi.call({
      block,
      target: '0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51',
      params: [],
      abi: abi['get_virtual_price']
    })
  ]);

  underlyingBalances = underlyingBalances.output;
  underlyingAddress = underlyingAddress.output;
  yVaultPrices = yVaultPrices.output;
  yCrvPrice = yCrvPrice.output;

  // convert cTokens into underlying tokens
  underlyingBalances.forEach((underlying, i) => {
    let balance = underlying.output;
    let address = underlyingAddress[i].output;
    let cAddress = underlying.input.target;
    balances[address] = balance;
    delete balances[cAddress];
  })

  // convert vault tokens into underlying values
  poolBalances.forEach((balanceOf, i) => {
    let balance = balanceOf.output;
    let address = balanceOf.input.target;

    if (BigNumber(balance).toNumber() <= 0) {
      return;
    }
    // assume CRETH2:ETH  = 1:1
    if (address === CRETH2) {
      balances[wETH] = BigNumber(balances[wETH] || 0).plus(balances[CRETH2]).toFixed();
      delete balances[CRETH2];
    } else if (address === yyCrv) {
      const yyCrvCash = BigNumber(balance).multipliedBy(yCrvPrice).div(1e18).div(1e12).multipliedBy(yVaultPrices[1].output).div(1e18).integerValue();
      balances[usdt] = BigNumber(balances[usdt] || 0).plus(yyCrvCash).toFixed();
      delete balances[yyCrv];
    } else {
      balances[address] = BigNumber(balances[address] || 0).plus(balance).toFixed();
    }
  });
  return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  start: 1599552000, // 09/08/2020 @ 8:00am (UTC)
  ethereum: { tvl }
}
