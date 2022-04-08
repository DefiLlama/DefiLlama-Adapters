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

        const symbol = join === "0xad37fd42185ba63009177058208dd1be4b136e6b"?"SAI": await sdk.api.erc20.symbol(gem)
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
        try{
          if(join !== "0x7b3799b30f268ba55f926d7f714a3001af89d359"){
            await sdk.api.abi.call({
              block,
              target: join,
              abi: MakerMCDConstants.dog
            })
          }
          return
        } catch(e){
          throw new Error("failed gem() and dog() on "+join)
        }
      }
    }))
  }

  return balances;
}

module.exports = {
  timetravel: true,
  methodology: `Counts all the tokens being used as collateral of CDPs.
  
  On the technical level, we get all the collateral tokens by fetching events, get the amounts locked by calling balanceOf() directly, unwrap any uniswap LP tokens and then get the price of each token from coingecko`,
  start: 1513566671, // 12/18/2017 @ 12:00am (UTC)
  tvl,
};
