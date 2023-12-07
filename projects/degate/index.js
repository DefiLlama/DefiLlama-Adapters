const ADDRESSES = require('../helper/coreAssets.json')
 /*==================================================
  Modules
  ==================================================*/

  const sdk = require('@defillama/sdk');

  const BigNumber = require('bignumber.js');
  const { getLogs } = require('../helper/cache/getLogs')

 /*==================================================
  Vars
  ==================================================*/

  const DEGATE_DEPOSIT_CONTRACT   = '0x54d7ae423edb07282645e740c046b9373970a168';
  const DEGATE_EXCHANGE_CONTRACT  = '0x9C07A72177c5A05410cA338823e790876E79D73B';

  const START_BLOCK = 18552105;

/*==================================================
  TVL
  ==================================================*/
  async function tvl(timestamp, block, _1, { api }) {    
    const logs = await getLogs({
      api,
      target: DEGATE_EXCHANGE_CONTRACT,
      topic: 'TokenRegistered(address,uint32)',
      eventAbi: 'event TokenRegistered (address token, uint32  tokenId)',
      onlyArgs: true,
      fromBlock: START_BLOCK,
    })
  
    const tokenAddresses = new Set();
    logs.forEach((log) => {
      tokenAddresses.add(log.token);
    });

    const erc20TokenBalances = (
      await sdk.api.abi
        .multiCall({
          abi: 'erc20:balanceOf',
          calls: Array.from(tokenAddresses).map((tokenAddress) => ({
            target: tokenAddress,
            params: DEGATE_DEPOSIT_CONTRACT,
          })),
          block,
        })
    ).output;

    let bal = await sdk.api.eth.getBalance({target: DEGATE_DEPOSIT_CONTRACT, block});
    let totalBalances = {
      [ADDRESSES.null]: BigNumber(bal.output || 0)
    };

    erc20TokenBalances.forEach(tokenBalance => {
      if (tokenBalance.success && new BigNumber(tokenBalance.output).isGreaterThan(0)) {
        const tokenAddress = tokenBalance.input.target.toLowerCase();
        totalBalances[tokenAddress] = new BigNumber(tokenBalance.output).toFixed();
      }
    });

    return totalBalances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    start: 1699746983, // Nov-11-2023 11:56:23 PM +UTC
    ethereum: { tvl }
  }
