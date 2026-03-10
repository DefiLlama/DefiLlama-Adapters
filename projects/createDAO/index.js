const { sumTokens2 } = require('../helper/unwrapLPs');
const { getLogs } = require('../helper/cache/getLogs');
const ADDRESSES = require('../helper/coreAssets.json');
const config = require('./config');

const DAO_CREATED_EVENT = 'event DAOCreated(address indexed creator, address indexed token, address indexed governor, address timelock, string daoName, string tokenName, string tokenSymbol, uint256 totalSupply)';

async function tvl(api) {
  const { factoryAddress, fromBlock } = config[api.chain];

  const daoLogs = await getLogs({
    api,
    target: factoryAddress,
    eventAbi: DAO_CREATED_EVENT,
    fromBlock,
    onlyArgs: true,
  });

  // V2 removed presale contracts — only timelock treasuries hold DAO funds
  const timelockAddresses = [...new Set(daoLogs.map(log => log.timelock))];

  if (timelockAddresses.length === 0) return {};

  // Core assets that DAO treasuries commonly hold + governance tokens from events
  const tokens = [
    ADDRESSES.null,
    ADDRESSES.ethereum.WETH,
    ADDRESSES.ethereum.USDC,
    ADDRESSES.ethereum.USDT,
    ADDRESSES.ethereum.DAI,
    ADDRESSES.ethereum.WBTC,
    ...new Set(daoLogs.map(log => log.token)),
  ];

  return sumTokens2({
    api,
    owners: timelockAddresses,
    tokens,
  });
}

module.exports = {
  methodology: 'TVL counts all assets (ETH and ERC20 tokens) held in DAO treasury (TimelockController) contracts created through the CreateDAO v2 factory. V2 has no presale custody contracts; all DAO funds are held in timelocks.',
  ethereum: { tvl },
};
