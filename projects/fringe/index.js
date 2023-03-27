const sdk = require('@defillama/sdk');
const PIT = require('./pit-abi.json');

const PRIMARY_LENDING_PLATFORM = "0x46558DA82Be1ae1955DE6d6146F8D2c1FE2f9C5E";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  const lendingTokensLength = Number((await sdk.api.abi.call({
    abi: PIT["getLendingTokensLength"],
    chain: 'ethereum',
    target: PRIMARY_LENDING_PLATFORM,
    params: [],
    block: chainBlocks['ethereum'],
  })).output);
  for (let i = 0; i < lendingTokensLength; i++) {
    const lendingToken = (await sdk.api.abi.call({
      abi: PIT["getLendingTokenByIndex"],
      chain: 'ethereum',
      target: PRIMARY_LENDING_PLATFORM,
      params: [i.toString()],
      block: chainBlocks['ethereum'],
    })).output;

    const bLendingToken = (await sdk.api.abi.call({
      abi: PIT["getLendingTokenInfo"],
      chain: 'ethereum',
      target: PRIMARY_LENDING_PLATFORM,
      params: [lendingToken],
      block: chainBlocks['ethereum'],
    })).output['bLendingToken'];

    const balance = (await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      chain: 'ethereum',
      target: lendingToken,
      params: [bLendingToken],
      block: chainBlocks['ethereum'],
    })).output;

    sdk.util.sumSingleBalance(balances, lendingToken, balance);
  }

  const projectTokensLength = Number((await sdk.api.abi.call({
    abi: PIT["getProjectTokensLength"],
    chain: 'ethereum',
    target: PRIMARY_LENDING_PLATFORM,
    params: [],
    block: chainBlocks['ethereum'],
  })).output);
  for (let i = 0; i < projectTokensLength; i++) {
    const projectToken = (await sdk.api.abi.call({
      abi: PIT["getProjectTokenByIndex"],
      chain: 'ethereum',
      target: PRIMARY_LENDING_PLATFORM,
      params: [i.toString()],
      block: chainBlocks['ethereum'],
    })).output;

    const balance = (await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      chain: 'ethereum',
      target: projectToken,
      params: [PRIMARY_LENDING_PLATFORM],
      block: chainBlocks['ethereum'],
    })).output;

    sdk.util.sumSingleBalance(balances, projectToken, balance);
  }

  return balances;
}

module.exports = {
  timetravel: true,
  methodology: 'Gets the value of all tokens locked in Fringe Finance\'s Primary Lending Platform',
  start: 14847363,
  misrepresentedTokens: false,
  ethereum: {
    tvl
  },
}
