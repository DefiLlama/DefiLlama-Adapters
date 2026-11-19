const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache')

const API_URL = 'https://api.mantle.xyz/api/v2/treasury/tokens';

const MNT = '0x3c3a81e81dc49a522a592e7622a7e711c06bf354';
const BIT = '0x1a4b46696b2bb4794eb3d4c26f1c55f9170fa4c5';
const USDe = ADDRESSES.ethereum.USDe;
const COOK = '0x9f0c013016e8656bc256f948cd4b79ab25c7b94d'
const ethenaFarm = '0x8707f238936c12c309bfc2b9959c35828acfc512';

const abi = "function stakes(address, address) view returns (uint256 stakedAmount, uint152 coolingDownAmount, uint104 cooldownStartTimestamp)";

const config = {
  ethereum: { key: 'eth', ownTokens: [MNT, BIT] },
  mantle: { key: 'mnt', ownTokens: [COOK, 'mnt'] },
}

const toAddress = id => (id === 'eth' || id === 'mnt') ? ADDRESSES.null : id;

async function getWallets(key) {
  const data = await getConfig('mantle-treasury', API_URL)
  const walletBalances = {};
  for (const { chain, id, walletAddress, amount } of data) {
    if (chain !== key) continue;
    walletBalances[walletAddress] ??= { owner: walletAddress, tokens: [] };
    walletBalances[walletAddress].tokens.push({ address: id, amount });
  }
  return Object.values(walletBalances);
};

async function getEthenaFarmingBalance(api, wallet) {
  const { stakedAmount, coolingDownAmount } = await api.call({ target: ethenaFarm, params: [wallet, USDe], abi });
  return Number(stakedAmount) + Number(coolingDownAmount);
};

async function tvl(api) {
  const own = config[api.chain].ownTokens;
  const ownerTokens = [];
  for (const { owner, tokens } of await getWallets(config[api.chain].key)) {
    for (const { address, amount } of tokens) {
      if (own.includes(address)) continue;
      else if (address === 'ethena-farming-usde') api.add(USDe, await getEthenaFarmingBalance(api, owner));
      else if (address === 'eigen-layer-eth') api.add(ADDRESSES.null, amount * 10 ** 18);
      else ownerTokens.push([[toAddress(address)], owner]);
    }
  }
  await api.sumTokens({ ownerTokens });
};

async function ownTokens(api) {
  const own = config[api.chain].ownTokens;
  const ownerTokens = [];
  for (const { owner, tokens } of await getWallets(config[api.chain].key)) {
    for (const { address } of tokens)
      if (own.includes(address)) ownerTokens.push([[toAddress(address)], owner]);
  }
  await api.sumTokens({ ownerTokens });
};

module.exports = {
  ethereum: { tvl, ownTokens },
  mantle: { tvl, ownTokens },
};
