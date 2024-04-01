const { troveAbi } = require('./abi');
const { call } = require('../helper/chain/starknet');
const { Decimal } = require('decimal.js');

const STARKNET_ETH_ADDRESS = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';

async function fetchBorrowStrategies() {
    const url = 'https://backend.nimbora.io/liquity/strategies';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    let data = await response.json();
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      const elementBack = element.troveMetadata;
      const newElem = {
        ethPrice: elementBack.ethPrice,
        borrowFees: (parseFloat(elementBack.borrowFees) * 100).toFixed(2),
        tcr: parseFloat(elementBack.tcr).toFixed(0),
        borrowRate: (parseFloat(elementBack.borrowRate) / 10 ** 18).toString(),
      };
      data[index].troveMetadata = newElem;
    }
    return data;
  }

async function tvl(_, _1, _2, { api }) {
    const strategies = await fetchBorrowStrategies();
    for (let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i];
        const troveDebt = await call({
            target: strategy.l2address,
            abi: troveAbi.get_l1_total_supply,
        });
        const collateralValue = Decimal(troveDebt.toString()).dividedBy(parseFloat(strategy.troveMetadata.borrowRate));
        console.log(strategy);
        console.log(strategy.troveMetadata.borrowRate);
        api.add(
            STARKNET_ETH_ADDRESS, 
            Math.floor(collateralValue)
        );
    }
}

module.exports = {
    methodology: "The TVL is calculated as a sum of total assets deposited into the Trove contracts.",
    starknet: {
        tvl,
    },
};