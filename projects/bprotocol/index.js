/*==================================================
  Modules
  ==================================================*/

  const _ = require('underscore');
  const sdk = require('@defillama/sdk');
  const abi = require('./abi');
  const BigNumber = require("bignumber.js");

/*==================================================
  Settings
  ==================================================*/

  const bTvlAddress = '0x60312e01A2ACd1Dac68838C949c1D20C609B20CF';
  const bcdpmanagerAddress = '0x3f30c2381CD8B917Dd96EB2f1A4F96D91324BBed';
  const ethIlk = '0x4554482d41000000000000000000000000000000000000000000000000000000';
  const mFirstBlock = 11257606
  const cFirstBlock = 11935020
  const registryAddress = "0xbf698df5591caf546a7e087f5806e216afed666a";
  const comptrollerAddress = "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B";

/*==================================================
  TVL
  ==================================================*/

  async function compoundTvl(timestamp, block) {
    if (block < cFirstBlock) return { '0x0000000000000000000000000000000000000000': '0' };

    // number of accounts
    const { output: avatarLength } = await sdk.api.abi.call(
      {
        block,
        target: registryAddress,
        params: [],
        abi: abi["avatarLength"]
      }
    )

    // list of account id's
    const avatarIds = Array.from({ length: Number(avatarLength) }, (_, i) => i)

    // list of account addresses
    const avatarsAdresess = (await sdk.api.abi.multiCall({
      abi: abi["avatars"],
      calls: avatarIds.map((id, ) => ({
        target: registryAddress,
        params: [id]
      })),
      block,
    })).output.map(({ output }) => output);

    // all of Compound's supply & borrow assets adresses
    const { output: cTokens } = await sdk.api.abi.call(
      {
        block,
        target: comptrollerAddress,
        params: [],
        abi: abi["getAllMarkets"]
      }
    )

    const balances = {}

    // for each of Compound's cTokens get all of our users accounts balance and the underlying token address
    await Promise.all(cTokens.map(async (cTokenAddress) => {
      try {
        // get the underlying token address
        const isCEth = cTokenAddress.toLowerCase() === "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5"
        const { output: token } = isCEth
          ? { output: '0x0000000000000000000000000000000000000000' } // ETH has no underlying asset on Compound
          : await sdk.api.abi.call(
            {
              block,
              target: cTokenAddress,
              params: [],
              abi: abi["underlying"]
            }
          )

        // making a call to get the asset balance for each of our users
        const calls = []

        avatarsAdresess.forEach(avatar => {
          calls.push({
            target: cTokenAddress,
            params: [avatar]
          })
        })

        const underlyingBalances = (await sdk.api.abi.multiCall({
          abi: abi["balanceOfUnderlying"],
          calls,
          block,
        })).output.map(({ output }) => output);

        // accumilating all our users balances to calculate the TVL for this indevidual asset
        const sumTotal = underlyingBalances.reduce((acc, val) => {
          return (new BigNumber(acc).plus(new BigNumber(val))).toString(10)
        }, "0")

        balances[token] = (new BigNumber(balances[token] || "0").plus(new BigNumber(sumTotal)) ).toString(10)
      } catch (err) {
        console.error(err)
      }
    }))
    return balances
  }

  async function makerTvl(timestamp, block) {
    if (block < mFirstBlock) return { '0x0000000000000000000000000000000000000000': '0' };

    const cdpiRes = await sdk.api.abi.call(
      {
        block,
        target: bTvlAddress,
        params: [bcdpmanagerAddress],
        abi: abi["cdpi"]
      });

    const maxCdp = Number(cdpiRes.output);
    const cdps = Array.from({ length: maxCdp }, (_, i) => i + 1)

    const smallCdps = Array.from({ length: 20 }, (_, i) => i + 1)
    const ethBalances = (await sdk.api.abi.multiCall({
      abi: abi["cdpTvl"],
      calls: cdps.map((cdp, ) => ({
        target: bTvlAddress,
        params: [bcdpmanagerAddress, cdp, ethIlk]
      })),
      block,
    })).output.map(value => value.output);

    let totalBalance = new BigNumber(0);
    ethBalances.forEach(balance => totalBalance = totalBalance.plus(new BigNumber(balance)));
    const balances = { '0x0000000000000000000000000000000000000000': totalBalance.toString(10) };

    return balances
  }

  async function tvl(timestamp, block) {
    const [cTvl, mTvl] = await Promise.all([compoundTvl(timestamp, block), makerTvl(timestamp, block)])
    // combine balances for Maker and Compound B.Protocol's TVL
    const allLendingPlatformBalances = {}
    // all assets in B.Protocol
    _.uniq(Object.keys(cTvl).concat(Object.keys(mTvl))).forEach(asset => {
      allLendingPlatformBalances[asset] = new BigNumber(cTvl[asset] || "0").plus(new BigNumber(mTvl[asset] || "0")).toString(10)
    })

    return allLendingPlatformBalances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'B.Protocol',
    token: null,
    category: 'lending',
    contributesTo: ['Maker', 'Compound'],
    start: 1605380632,  // 11/14/2020 @ 7:03pm (UTC)
    tvl,
  };
