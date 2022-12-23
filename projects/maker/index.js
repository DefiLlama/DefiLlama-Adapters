// const utils = require('web3-utils');
const sdk = require('@defillama/sdk');
const MakerSCDConstants = require("./abis/makerdao.js");
const MakerMCDConstants = require("./abis/maker-mcd.js");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { requery } = require('../helper/requery.js');

async function getJoins(block) {
  // let rely = utils.sha3("rely(address)").substr(0, 10);
  // let relyTopic = utils.padRight(rely, 64);
  let relyTopic = '0x65fae35e00000000000000000000000000000000000000000000000000000000'

  let joins = [];

  // get list of auths
  const logs = (
    await sdk.api.util
      .getLogs({
        keys: [],
        toBlock: block,
        target: MakerMCDConstants.VAT,
        fromBlock: MakerMCDConstants.STARTBLOCK,
        topics: [relyTopic],
      })
  ).output;

  let auths = logs.map(auth => {
    return `0x${auth.topics[1].substr(26)}`;
  });

  const ilks = await sdk.api.abi.multiCall({
    abi: MakerMCDConstants.ilk,
    calls: auths.map((auth) => ({
      target: auth,
    })),
    block
  });
  await requery(ilks, "ethereum", block, MakerMCDConstants.ilk)
  await requery(ilks, "ethereum", block, MakerMCDConstants.ilk)  // make sure that failed calls actually fail

  for (let ilk of ilks.output) {
    if (ilk.output) {
      joins.push(ilk.input.target)
    }
  }

  return joins;
}

async function tvl(timestamp, block) {
  const toa = [
    [MakerSCDConstants.WETH_ADDRESS, MakerSCDConstants.TUB_ADDRESS,],
  ]

  const blacklistedJoins = [
    '0x7b3799b30f268ba55f926d7f714a3001af89d359',
    '0x41ca7a7aa2be78cf7cb80c0f4a9bdfbc96e81815',
  ]
  if (block > MakerMCDConstants.STARTBLOCK) {
    let joins = await getJoins(block);
    joins = joins.filter(i => !blacklistedJoins.includes(i))

    const { output: gems } = await sdk.api.abi.multiCall({
      abi: MakerMCDConstants.gem,
      block, calls: joins.map(i => ({ target: i })),
    })
    const dogCalls = []
    gems.forEach(({ success, output, input: { target } }) => {
      if (!success) {
        dogCalls.push({ target })
        return;
      }

      toa.push([output, target])
    })

    const { output: dogRes } = await sdk.api.abi.multiCall({
      abi: MakerMCDConstants.dog,
      calls: dogCalls, block,
    })

    const failedCalls = dogRes.filter(i => !i.success)
    if (failedCalls.length) {
      failedCalls.forEach(i => console.log('Failed both gem and dog calls', i.input.target))
      throw new Error('Failed both gem and dog calls')
    }
  }

  return sumTokens2({ block, tokensAndOwners: toa })
}

module.exports = {
  timetravel: true,
  methodology: `Counts all the tokens being used as collateral of CDPs.
  
  On the technical level, we get all the collateral tokens by fetching events, get the amounts locked by calling balanceOf() directly, unwrap any uniswap LP tokens and then get the price of each token from coingecko`,
  start: 1513566671, // 12/18/2017 @ 12:00am (UTC)
  ethereum: {
    tvl
  },
};
