const BigNumber = require('bignumber.js');
const { call, toHex } = require('../helper/chain/icx');

const ORACLE_CONTRACT = 'cxe647e0af68a4661566f5e9861ad4ac854de808a2';
const LIQUIDTY_LEGACY_STRATEGY_CONTRACT = 'cx27eae7726c18d6cdfffa071e01d1f3a0950d7c3f';
const BORROWER_LEGACY_STRATEGY_CONTRACT = 'cxee1fa51a14783577bc4b900c13579b9bcb0b55f5';
const OMM_LENDING_STRATEGY_CONTRACT = 'cx4c18433c607bd8c6a0953e9627f5a0892ac40363';
const OMM_SICX_CONTRACT = 'cx2609b924e33ef00b648a409245c7ea394c467824';
const OMM_ORACLE_CONTRACT = 'cx189f03875da766878c68753da7492c080bcc2dbe';
const OMM_AUTO_STAKING_STRATEGY_CONTRACT = 'cxa6e4587bad1d2bb4e9098ea9c19b8781b70c2ad5';

async function getICXPrice() {
  return call(ORACLE_CONTRACT, 'get_reference_data', {
    _base: 'ICX',
    _quote: 'USD',
  })
    .then(r => r['rate'])
    .then(toHex);
}

async function getOMMPrice() {
  return call(OMM_ORACLE_CONTRACT, 'get_reference_data', {
    _base: 'OMM',
    _quote: 'USD',
  })
    .then(toHex);
}

async function ommSIcxRate() {
  return call(OMM_SICX_CONTRACT, 'priceInLoop')
    .then(toHex);
}

async function getTotalSupplyLP() {
  return call(LIQUIDTY_LEGACY_STRATEGY_CONTRACT, 'getIcxPool')
    .then(toHex);
}

async function getTotalSupplyBorrower() {
  return new BigNumber(0)
  /* return call(BORROWER_LEGACY_STRATEGY_CONTRACT, 'getLoanInfo')
    .then(value => {
      return value ? toHex(value.collateral) : new BigNumber(0);
    }); */
}

async function getOMMLendingStatus() {
  return call(OMM_LENDING_STRATEGY_CONTRACT, 'getStatus')
    .then(({ fTokenRate, fTokenPool }) => {
      return {
        fTokenRate: toHex(fTokenRate),
        fTokenPool: toHex(fTokenPool),
      };
    });
}

async function getOmmAutoStakingStatus() {
  return call(OMM_AUTO_STAKING_STRATEGY_CONTRACT, 'getStatus')
    .then(({ fTokenRate, ommPool }) => {
      const rate = toHex(fTokenRate);
      const pool = toHex(ommPool);
      return {
        ommRate: rate,
        ommPool: pool,
      };
    });
}
const tvl = async (api) => {
  const [ICXPrice, totalSupply, loanInfo, ommRatesIcx, { fTokenRate, fTokenPool }, ommPrice, { ommRate, ommPool }] = await Promise.all([
    getICXPrice(),
    getTotalSupplyLP(),
    getTotalSupplyBorrower(),
    ommSIcxRate(),
    getOMMLendingStatus(),
    getOMMPrice(),
    getOmmAutoStakingStatus(),
  ]);

  const values = [
    Number(totalSupply) * ICXPrice,
    Number(loanInfo) * ICXPrice,
    Number(fTokenPool) * fTokenRate * ommRatesIcx * ICXPrice,
    Number(ommPool) * ommRate * ommPrice,
  ];

  const totalTVL = values.reduce((sum, val) => sum + (isNaN(val) ? 0 : val), 0);
  api.addUSDValue(Math.round(totalTVL))
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL consists of liquidty on the DEX and deposits made to the lending program. Data is pulled from the ICX API "https://ctz.solidwallet.io/api/v3"',
  icon: { tvl }
}
