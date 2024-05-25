const { sumTokens2 } = require('../helper/unwrapLPs');

async function tvl(api) {
  return sumTokens2({
    owners: [
      '0xf2d01bc0dfaca01a3dfcaf94fa571c5a164ea80e',
      '0xba3eb615d4c4447d06db21f8fc1727451a8d8fc2',
    ],
    tokens: [
      '0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f',
      '0xE6Bb7d0b2CC692bca53073eEf5e7FF375F0c4fad',
      '0xC6610679666250eBE8b8ec8542b37F2df8b8510d',
      '0x41E3c32B405845d5851f3ff7cE02a5238e76c2E3',
    ],
    api,
  }); //wbtc and dmnd
}

module.exports = {
  btr: { tvl },
};
