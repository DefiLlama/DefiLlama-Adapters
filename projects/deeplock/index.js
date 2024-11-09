const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { pool2s } = require("../helper/pool2");
const { vestingHelper } = require("../helper/unknownTokens");

const deepLockLockerContractV1 = "0x10dD7FD1Bf3753235068ea757f2018dFef94B257";
const deepLockLockerContractV2 = "0x3f4D6bf08CB7A003488Ef082102C2e6418a4551e";

const stakingPool2Contracts = [
  "0x27F33DE201679A05A1a3ff7cB40a33b4aA28758e",
  "0x03dab688d32507B53Cc91265FA47760b13941250",
];
const lpAddresses = [
  "0xc1fccf4170fa9126d6fb65ffc0dd5a680a704094",
  "0x596e48cde23ba55adc2b8b00b4ef472184e2a9e3",
];

const bscTvl = async (ts, _b, { bsc: block }) => {
  const blacklist = [
    '0x25f4a012b06b43aff3918acbf0cc113119aea194',
    '0xce80ab50fca1564426ca09a977b029377c50c909',
    '0xa3f0a9ad24a749f3aa14f33c019b708259cfa514',
    '0xdde9e8d669115542eff4923c647c53b46c1735f9',
    '0x9f0eec882f958cbeef99cab17ea3cf5909c62e77',
    '0x168926cd2b2559c8359a7c0ffd2be7ad56e1f2a4',
    '0x7963deca5ec22ffc4629f4767de372e1c81ad8fa',
    '0xa6467d83a32452ab9091ca4e8edc3831f8aab088',
    '0xe18af4897e0fa706ca65ffefef24e5f8ee1d1cea',
    '0x19024b0ed8d4e4d5cbf7dfa94a82804bc9a79be3',
    '0x347c5b51449074c5487cc193459c5babeebcef07',
    '0x290183a09390a9d34c10171cf84c9c36b6cad9ed',
    '0xc0600c41273e71dc8736c5e2128c7979ce3bbbac',
    '0x5880a0aebd1af8c68497088293ca548c63fd7b0f',
    '0x3172057a27b0dbc48a99b8fe2222c4535d56b44c',
    '0xf2abb94b826199311d51706e6b32aa3bf8539c89',
    '0x7108955947e352b351c4bB20b0a31A3598E7FEEC',
    '0xa6124221ed6d2e2f18da78c3cce6f52a8eec1a69',
    '0x85a5879ed3b3d11bb370d94b79db80b984f5cbf9',
    '0x17a273794516390043814059dc7f29f789972d0a',
    '0x3f4D6bf08CB7A003488Ef082102C2e6418a4551e',
    '0x03a3cDa7F684Db91536e5b36DC8e9077dC451081',
    '0xd43b226d365d8b22ba472afc2fa769b356eb5d47',
    '0x8d98a4e36ca048b8e4616564e5a8ebb78895ddff',
    '0x1337ace33c2b3fc17d85f33dbd0ed73a896148b5',
    '0x486dccaf152b271630216d62c00188f2558f6bec',
    '0xf0ee026f572c4a229dc67a692244e90abac29ec2',
  ].map(i => i.toLowerCase())

  const chain = 'bsc'
  const balances = {}
  const contracts = [
    deepLockLockerContractV1,
    deepLockLockerContractV2,
  ]

  const { output: lengths } = await sdk.api.abi.multiCall({
    abi: abi.depositId,
    calls: contracts.map(i => ({ target: i })),
    chain, block,
  })

  const allBalances = await Promise.all(contracts.map((vault, i) => getBalances(vault, lengths[i].output)))
  allBalances.forEach(balance => {
    Object.entries(balance).forEach(([token, val]) => sdk.util.sumSingleBalance(balances, token, val))
  })

  delete balances['bsc:0x60de5f9386b637fe97af1cc05f25548e9baaee19'] // remove deeplock token from tvl calculation
  delete balances['bsc:0x64f36701138f0e85cc10c34ea535fdbadcb54147'] // remove Anon INU - incorrect price
  return balances;

  async function getBalances(vault, length) {
    const calls = []
    for (let i = 1; i <= length; i++)
      calls.push({ target: vault, params: i })
    const { output } = await sdk.api.abi.multiCall({
      abi: abi.lockedToken, requery: true,
      calls, chain, block,
    })
    const tokens = output.map(i => i.output.tokenAddress)
    return vestingHelper({
      useDefaultCoreAssets: true,
      blacklist,
      owner: vault,
      tokens,
      block, chain,
      log_coreAssetPrices: [
        300/ 1e18,
        1/ 1e18,
        1/ 1e18,
        1/ 1e18,
      ],
      log_minTokenValue: 1e6,
    })
  }
};

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    pool2: pool2s(stakingPool2Contracts, lpAddresses),
    tvl: bscTvl,
  },
  methodology:
    "Counts tvl of all the tokens locked on the locker through DeepLockLocker Contracts",
};
