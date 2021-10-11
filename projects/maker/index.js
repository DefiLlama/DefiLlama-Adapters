const BigNumber = require('bignumber.js');
const utils = require('web3-utils');
const sdk = require('@defillama/sdk');
const MakerSCDConstants = require("./abis/makerdao.js");
const MakerMCDConstants = require("./abis/maker-mcd.js");
const { unwrapUniswapLPs } = require('../helper/unwrapLPs');
const { requery } = require('../helper/requery.js');

async function getJoins(block) {
  let rely = utils.sha3("rely(address)").substr(0, 10);
  let relyTopic = utils.padRight(rely, 64);

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
  await requery(ilks, "ethereum", block, MakerMCDConstants.ilk) // make sure that failed calls actually fail

  for (let ilk of ilks.output) {
    if (ilk.output) {
      joins.push(ilk.input.target)
    }
  }

  return joins;
}

async function tvl(timestamp, block) {
  let balances = {};
  balances[MakerSCDConstants.WETH_ADDRESS] = (await sdk.api.erc20.balanceOf({
    block,
    target: MakerSCDConstants.WETH_ADDRESS,
    owner: MakerSCDConstants.TUB_ADDRESS
  })).output;

  if (block >= MakerMCDConstants.STARTBLOCK) {
    let joins = await getJoins(block);

    await Promise.all(joins.map(async join => {
      try {
        const gem = (await sdk.api.abi.call({
          block,
          target: join,
          abi: MakerMCDConstants.gem
        })).output;
        const balance = (await sdk.api.erc20.balanceOf({
          target: gem,
          owner: join,
          block
        })).output;

        const symbol = await sdk.api.erc20.symbol(gem)
        if (symbol.output === "UNI-V2") {
          await unwrapUniswapLPs(balances, [{
            token: gem,
            balance
          }],
            block)
        } else {
          sdk.util.sumSingleBalance(balances, gem, balance);
        }
      } catch (e) {
        return
      }
    }))

    let pie = (await sdk.api.abi.call({
      block,
      target: MakerMCDConstants.POT,
      abi: MakerMCDConstants.Pie
    })).output;

    sdk.util.sumSingleBalance(balances, MakerMCDConstants.DAI, pie);
  }

  return balances;
}

module.exports = {
  methodology: `Counts all the tokens being used as collateral of CDPs and the DAI locked in the DSR (Dai Savings Rate) contract.
  
  On the technical level, we get all the collateral tokens by fetching events, get the amounts locked by calling balanceOf() directly, unwrap any uniswap LP tokens and then get the price of each token from coingecko`,
  start: 1513566671, // 12/18/2017 @ 12:00am (UTC)
  tvl,
};
