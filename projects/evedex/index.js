'use strict';

const ADDRESSES = require('../helper/coreAssets.json')

const tvl = async (api) => {
    const target = ADDRESSES.eventum.USDT;
    const totalSupply = await api.call({
        abi: 'erc20:totalSupply',
        target,
    });
    api.add(target, totalSupply);
    return api.getBalances();
};

module.exports = {
  eventum: { tvl },
}