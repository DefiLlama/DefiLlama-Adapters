const ADDRESSES = require('../helper/coreAssets.json')
async function tvl(api) {
  const { lending: lendingContract, tvlAddresses } = config[api.chain];

  return api.sumTokens({ owner: lendingContract, tokens: tvlAddresses });
}

async function borrowed(api) {
  const { lending: lendingContract, borrowAddresses } = config[api.chain];

  const borrowAmounts = await api.multiCall({
    abi: 'function getPseudoTotalBorrowAmount(address) view returns (uint256)',
    target: lendingContract,
    calls: borrowAddresses
  })

  api.add(borrowAddresses, borrowAmounts)
}

const aavePools = [
  "0x724dc807b04555b71ed48a6896b6F41593b8C637",
  "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8",
  ADDRESSES.arbitrum.WSTETH,
  "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE",
  "0x6ab707Aca953eDAeFBc4fD23bA73294241490620",
];

const config = {
  arbitrum: {
    lending: '0x9034a49587bD2c1Af27598E0f04F30Db66C87Ebf',
    feeManager: '0x90a022796798f9dbA1Da0f8645234B284d4E8EC6',
    tvlAddresses: aavePools,
    borrowAddresses: aavePools
  },
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, borrowed };
});
