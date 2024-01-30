const { staking } = require('../helper/staking')
const config = {
  ethereum: { ispToken: '0xc8807f0f5ba3fa45ffbdc66928d71c5289249014', ispStaking: '0x8D28b93BfaA4adD716aC8B993e78c3844d8eB01A', },
  bsc: { ispToken: '0xd2e7b964770fcf51df088a5f0bb2d33a3c60cccf', ispStaking: '0xb6506E019CEF6d794c3304134B2b38a23090a0B0', },
  manta: { ispToken: '0xBAb1c57ec0bB0aE81d948503E51d90166459D154', ispStaking: '0x4519cc4A5A43ef66eaBEE810f54E23f655C293Ed', }
};

module.exports = {
  methodology: 'Counts the number of ISP tokens in the native Ispolink protocols.',
};

Object.keys(config).forEach(chain => {
  const { ispToken, ispStaking } = config[chain]
  module.exports[chain] = { tvl: () => ({}), staking: staking(ispStaking, ispToken) };
});
