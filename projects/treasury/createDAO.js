const { sumTokens2 } = require('../helper/unwrapLPs');
const { getLogs } = require('../helper/cache/getLogs');
const ADDRESSES = require('../helper/coreAssets.json');

const config = {
  ethereum: {
    factoryAddress: '0xc852E5Cb44C50614a82050163aB7170cB88EB5F9',
    fromBlock: 24424853,
  },
};

const DAO_CREATED_EVENT = 'event DAOCreated(address indexed creator, address indexed token, address indexed governor, address timelock, string daoName, string tokenName, string tokenSymbol, uint256 totalSupply)';

async function getDAOData(api) {
  const { factoryAddress, fromBlock } = config[api.chain];
  const daoLogs = await getLogs({
    api,
    target: factoryAddress,
    eventAbi: DAO_CREATED_EVENT,
    fromBlock,
    onlyArgs: true,
  });
  const timelockAddresses = [...new Set(daoLogs.map(log => log.timelock))];
  const governanceTokens = [...new Set(daoLogs.map(log => log.token))];
  return { timelockAddresses, governanceTokens };
}

async function tvl(api) {
  const { timelockAddresses, governanceTokens } = await getDAOData(api);
  if (timelockAddresses.length === 0) return {};

  const coreTokens = [
    ADDRESSES.null,
    ADDRESSES.ethereum.WETH,
    ADDRESSES.ethereum.USDC,
    ADDRESSES.ethereum.USDT,
    ADDRESSES.ethereum.DAI,
    ADDRESSES.ethereum.WBTC,
  ];

  return sumTokens2({
    api,
    owners: timelockAddresses,
    tokens: coreTokens,
    blacklistedTokens: governanceTokens,
  });
}

async function ownTokens(api) {
  const { timelockAddresses, governanceTokens } = await getDAOData(api);
  if (timelockAddresses.length === 0 || governanceTokens.length === 0) return {};

  return sumTokens2({
    api,
    owners: timelockAddresses,
    tokens: governanceTokens,
  });
}

module.exports = {
  methodology: 'Treasury counts all assets held in DAO treasury (TimelockController) contracts created through the CreateDAO v2 factory. Governance tokens created by each DAO are exported separately as ownTokens.',
  ethereum: { tvl, ownTokens },
};
