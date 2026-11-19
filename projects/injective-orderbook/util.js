const { get } = require('../helper/http');

const EXCHANGE_MODULE_ADDRESS = 'inj14vnmw2wee3xtrsqfvpcqg35jg9v7j2vdpzx0kk';
const LCD_ENDPOINT = 'https://sentry.lcd.injective.network';

const TYPES = {
  BANK: 'BANK',
  SPOT: 'SPOT',
  DERIVATIVES: 'DERIVATIVES',
};

function getOrderBookTvl(typeStr) {
  return async (api) => {
    // Injective's x/exchange module holds a unified balance pool for both spot and derivatives.
    // To prevent double-counting, report the full module TVL under the main adapter and return empty for the legacy spot split.
    if (typeStr === TYPES.SPOT) {
      return api.getBalances();
    }

    let nextKey = '';

    do {
      const url = `${LCD_ENDPOINT}/cosmos/bank/v1beta1/balances/${EXCHANGE_MODULE_ADDRESS}?pagination.limit=200${
        nextKey ? `&pagination.key=${encodeURIComponent(nextKey)}` : ''
      }`;

      const res = await get(url);
      const balances = res?.balances || [];

      for (const { denom, amount } of balances) {
        if (!amount || amount === '0') continue;

        if (denom === 'inj') {
          api.addCGToken('injective-protocol', Number(amount) / 1e18);
        } else if (denom.startsWith('peggy0x')) {
          const ethAddress = denom.replace('peggy', '').toLowerCase();
          api.add(`ethereum:${ethAddress}`, amount, { skipChain: true });
        } else if (denom.startsWith('erc20:0x')) {
          api.add(denom.replace('erc20:', ''), amount);
        } else {
          api.add(denom, amount);
        }
      }

      nextKey = res?.pagination?.next_key;
    } while (nextKey);

    return api.getBalances();
  };
}

module.exports = {
  TYPES,
  getOrderBookTvl,
};
