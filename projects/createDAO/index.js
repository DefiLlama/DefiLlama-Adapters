const { sumTokens2 } = require('../helper/unwrapLPs');
const { getLogs } = require('../helper/cache/getLogs');
const ADDRESSES = require('../helper/coreAssets.json');
const config = require('./config');

const DAO_CREATED_EVENT = 'event DAOCreated(address indexed creator, address indexed token, address indexed governor, address timelock, string daoName, string tokenName, string tokenSymbol, uint256 totalSupply)';

// Common tokens that DAO treasuries may hold
const COMMON_TOKENS = [
  ADDRESSES.null,               // Native ETH
  ADDRESSES.ethereum.USDC,      // USDC
  ADDRESSES.ethereum.USDT,      // USDT
  ADDRESSES.ethereum.DAI,       // DAI
  ADDRESSES.ethereum.WETH,      // WETH
  ADDRESSES.ethereum.WBTC,      // WBTC
  ADDRESSES.ethereum.WSTETH,    // wstETH
];

async function tvl(api) {
  const { factoryAddress, fromBlock } = config[api.chain];

  const daoLogs = await getLogs({
    api,
    target: factoryAddress,
    eventAbi: DAO_CREATED_EVENT,
    fromBlock,
    onlyArgs: true,
  });

  const timelockAddresses = daoLogs.map(log => log.timelock);

  if (timelockAddresses.length === 0) return {};

  return sumTokens2({
    api,
    owners: timelockAddresses,
    tokens: COMMON_TOKENS,
  });
}

module.exports = {
  methodology: 'TVL counts all assets (ETH and ERC20 tokens) held in DAO treasury (TimelockController) contracts created through the CreateDAO v2 factory.',
  ethereum: { tvl },
};
