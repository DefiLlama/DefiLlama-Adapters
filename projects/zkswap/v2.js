const ADDRESSES = require('../helper/coreAssets.json')
const  sdk = require('@defillama/sdk');
const { getLogs } = require('../helper/cache/getLogs')

const MAIN = '0x6dE5bDC580f55Bc9dAcaFCB67b91674040A247e3';
const GOVERNANCE = '0x86E527BC3C43E6Ba3eFf3A8CAd54A7Ed09cD8E8B';
const START_BLOCK = 12810001 ;

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
