const axios = require('axios');
const BigNumber = require('bignumber.js');

const icxApiEndpoint = 'https://ctz.solidwallet.io/api/v3';
const ORACLE_CONTRACT = 'cxe647e0af68a4661566f5e9861ad4ac854de808a2';
const LIQUIDTY_LEGACY_STRATEGY_CONTRACT = 'cx27eae7726c18d6cdfffa071e01d1f3a0950d7c3f';
const BORROWER_LEGACY_STRATEGY_CONTRACT = 'cxee1fa51a14783577bc4b900c13579b9bcb0b55f5';
const OMM_LENDING_STRATEGY_CONTRACT = 'cx4c18433c607bd8c6a0953e9627f5a0892ac40363';
const OMM_SICX_CONTRACT = 'cx2609b924e33ef00b648a409245c7ea394c467824';
const OMM_ORACLE_CONTRACT = 'cx189f03875da766878c68753da7492c080bcc2dbe';
const OMM_AUTO_STAKING_STRATEGY_CONTRACT = 'cxa6e4587bad1d2bb4e9098ea9c19b8781b70c2ad5';

const LOOP = new BigNumber('1000000000000000000');

const utils = {
  parseHex(value) {
    return new BigNumber(value).div(LOOP);
  },
  toHex(num) {
    return `0x${Number(num).toString(16)}`;
  },
}

async function icxCall(address, method, params) {
  const response = await axios.post(icxApiEndpoint, {
    jsonrpc: '2.0',
    method: 'icx_call',
    id: 1234,
    params: {
      to: address,
      dataType: 'call',
      data: {
          method: method,
          params: params
      }
    },
  });
  return response.data.result;
}

async function getICXPrice() {
  return icxCall(ORACLE_CONTRACT, 'get_reference_data', {
    _base: 'ICX',
    _quote: 'USD',
  })
    .then(r => r['rate'])
    .then(d => utils.parseHex(d));
}

async function getOMMPrice() {
  return icxCall(OMM_ORACLE_CONTRACT, 'get_reference_data', {
    _base: 'OMM',
    _quote: 'USD',
  })
    .then(d => utils.parseHex(d));
}

async function ommSIcxRate() {
  return icxCall(OMM_SICX_CONTRACT, 'priceInLoop')
    .then(d => utils.parseHex(d));
}

async function getTotalSupplyLP() {
  return icxCall(LIQUIDTY_LEGACY_STRATEGY_CONTRACT, 'getIcxPool')
    .then(d => utils.parseHex(d));
}

async function getTotalSupplyBorrower() {
  return icxCall(BORROWER_LEGACY_STRATEGY_CONTRACT, 'getLoanInfo')
    .then(value => {
      return value ? utils.parseHex(value.collateral) : new BigNumber(0);
    });
}

async function getOMMLendingStatus() {
  return icxCall(OMM_LENDING_STRATEGY_CONTRACT, 'getStatus')
    .then(({ fTokenRate, fTokenPool }) => {
      return {
        fTokenRate: utils.parseHex(fTokenRate),
        fTokenPool: utils.parseHex(fTokenPool),
      };
    });
}

async function getOmmAutoStakingStatus() {
  return icxCall(OMM_AUTO_STAKING_STRATEGY_CONTRACT, 'getStatus')
    .then(({ fTokenRate, ommPool }) => {
      const rate = utils.parseHex(fTokenRate);
      const pool = utils.parseHex(ommPool);
      return {
        ommRate: rate,
        ommPool: pool,
      };
    });
}

async function fetch() {
  const [
    ICXPrice,
    totalSupply,
    loanInfo,
    ommRatesIcx,
    { fTokenRate, fTokenPool },
    ommPrice,
    { ommRate, ommPool },
   ] = await Promise.all([
      getICXPrice(),
      getTotalSupplyLP(),
      getTotalSupplyBorrower(),
      ommSIcxRate(),
      getOMMLendingStatus(),
      getOMMPrice(),
      getOmmAutoStakingStatus(),
  ]);

  const values = await Promise.all([
    totalSupply.times(ICXPrice),
    loanInfo.times(ICXPrice),
    fTokenPool.times(fTokenRate).times(ommRatesIcx).times(ICXPrice),
    ommPool.times(ommRate).times(ommPrice),
  ]);

  const tvl = values.reduce((pre, cur) => {
    return pre.plus(cur || new BigNumber(0));
  }, new BigNumber(0));

  return tvl;
}

module.exports = {
  methodology: 'TVL consists of liquidty on the DEX and deposits made to the lending program. Data is pulled from the ICX API "https://ctz.solidwallet.io/api/v3"',
  fetch,
}
