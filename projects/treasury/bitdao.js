const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { nullAddress } = require("../helper/treasury");
const { getConfig } = require('../helper/cache')

const API_URL = 'https://api.mantle.xyz/api/v2/treasury/tokens';
const MNT = '0x3c3a81e81dc49a522a592e7622a7e711c06bf354';
const USDe = ADDRESSES.ethereum.USDe;
const COOK = '0x9f0c013016e8656bc256f948cd4b79ab25c7b94d'
const ethenaFarm = '0x8707f238936c12c309bfc2b9959c35828acfc512';
const SPECIFIC_TOKENS = ['eth', 'ethena-farming-usde', 'eigen-layer-eth', 'mnt'];

const abi = "function stakes(address, address) view returns (uint256 stakedAmount, uint152 coolingDownAmount, uint104 cooldownStartTimestamp)";

const isSpecificToken = token => SPECIFIC_TOKENS.includes(token);

const getEthenaFarmingBalance = async (api, wallet) => {
  const { stakedAmount, coolingDownAmount } = await api.call({ target: ethenaFarm, params: [wallet, USDe], abi });
  return Number(stakedAmount) + Number(coolingDownAmount);
};

const getTvlData = async (api, key) => {
  const data = await getConfig('mantle-treasury', API_URL)
  const rawDatas = data.filter(({ chain }) => key === chain);
  const datas = rawDatas.map(({ id, walletAddress, amount }) => ({ id, walletAddress, amount }));

  const wallets = Object.values(
    datas.reduce((acc, { id, walletAddress, amount }) => {
      acc[walletAddress] = acc[walletAddress] || { owner: walletAddress, tokens: [] };
      acc[walletAddress].tokens.push({ address: id, amount });
      return acc;
    }, {})
  );

  const uniqueOwners = new Set();
  const uniqueTokens = new Set();

  for (const { owner, tokens } of wallets) {
    const eigenLayerToken = tokens.find(token => token.address === 'eigen-layer-eth');
    if (tokens.some(token => token.address === 'eth')) api.add(nullAddress, (await sdk.api.eth.getBalance({ target: owner })).output);
    if (tokens.some(token => token.address === 'mnt')) api.add(MNT, (await sdk.api.eth.getBalance({ target: owner })).output, { skipChain: true });
    if (tokens.some(token => token.address === 'ethena-farming-usde')) api.add(USDe, await getEthenaFarmingBalance(api, owner));
    if (eigenLayerToken) api.add(nullAddress, eigenLayerToken.amount * 10 ** 18);

    const nonSpecificTokens = tokens.filter(token => !isSpecificToken(token.address));
    if (nonSpecificTokens.length > 0) {
      uniqueOwners.add(owner);
      nonSpecificTokens.forEach(token => uniqueTokens.add(token.address));
    }
  }

  return { owners: Array.from(uniqueOwners), tokens: Array.from(uniqueTokens) };
};

module.exports = {
  ethereum: {
    tvl: sdk.util.sumChainTvls([async ({ api }) => {
      const { owners, tokens } = await getTvlData(api, 'eth')
      return api.sumTokens({ owners, tokens, blacklistedTokens: [MNT] });
    }]),
    ownTokens: async ({ api }) => {
      const { owners } = await getTvlData(api, 'eth')
      return api.sumTokens({ ownerTokens: owners.map(owner => [[MNT], owner]) });
    }
  },
  mantle: {
    tvl: async (api) => {
      const { owners, tokens } = await getTvlData(api, 'mnt')
      return api.sumTokens({ owners, tokens, blacklistedTokens: [COOK] }); 
    },
    ownTokens: async ({ api }) => {
      const { owners } = await getTvlData(api, 'mnt')
      return api.sumTokens({ ownerTokens: owners.map(owner => [[COOK], owner]) });
    }
  },
}
