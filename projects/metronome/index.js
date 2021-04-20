/*==================================================
  Modules
  ==================================================*/

  const sdk = require('@defillama/sdk');
  const BigNumber = require("bignumber.js");
  const _ = require('underscore');
/*==================================================
  TVL
  ==================================================*/

  async function tvl(timestamp, block) {
    const acc = '0x686e5ac50D9236A9b7406791256e47feDDB26AbA';
    const met = '0xa3d58c4E56fedCae3a7c43A725aeE9A71F0ece4e';
    const proceeds = '0x68c4b7d05fae45bcb6192bb93e246c77e98360e1';

    const [accBalance, proceedsBalance] = await Promise.all([
      sdk.api.eth.getBalance({ target: acc, block }),
      sdk.api.eth.getBalance({ target: proceeds, block })
    ]);

    const ethBalance = ((BigNumber(accBalance.output || 0))
      .plus(BigNumber(proceedsBalance.output || 0)))
      .toFixed();

    let metBalance = (await sdk.api.abi.call({
      block,
      target: met,
      params: acc,
      abi: 'erc20:balanceOf'
    })).output;

    let balances = {
      [met]: metBalance,
      "0x0000000000000000000000000000000000000000": ethBalance,
    };

    return balances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'Metronome',
    website: 'https://metronome.io',
    token: 'MET',
    category: 'assets',  // allowed values as shown on DefiPulse: 'Derivatives', 'DEXes', 'Lending', 'Payments', 'Assets'
    start: 1527076766,        // block 5659904
    tvl,
  };
