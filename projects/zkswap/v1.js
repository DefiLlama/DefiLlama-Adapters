const ADDRESSES = require('../helper/coreAssets.json')
const  sdk = require('@defillama/sdk');
const { getLogs } = require('../helper/cache/getLogs')

const MAIN = '0x8ECa806Aecc86CE90Da803b080Ca4E3A9b8097ad';
const GOVERNANCE = '0x02ecef526f806f06357659fFD14834fe82Ef4B04';
const START_BLOCK = 11841962;

module.exports = async function tvl(timestamp, block, _1, { api }) {
  // ETH
  const ETHBalance = (await sdk.api.eth.getBalance({target: MAIN, block})).output;
  const balances = {
    [ADDRESSES.null]: ETHBalance
  }

  // ERC20
  const topic = 'NewToken(address,uint16)';
  const logs = (
    await getLogs({
      api,
        target: GOVERNANCE,
        fromBlock: START_BLOCK,
        topic,
      })
  );

  const tokenAddresses = logs.map(log => `0x${log.topics[1].slice(64 - 40 + 2, 64 + 2)}`.toLowerCase());

  const calls = tokenAddresses.map(tokenAddress => ({
    target: tokenAddress,
    params: MAIN
  }));

  const ERC20Balances = await sdk.api.abi.multiCall({
    block,
    calls,
    abi: 'erc20:balanceOf'
  });

  sdk.util.sumMultiBalanceOf(balances, ERC20Balances);

  return balances;
}
