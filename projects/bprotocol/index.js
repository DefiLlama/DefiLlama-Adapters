const ADDRESSES = require('../helper/coreAssets.json')
/*==================================================
  Modules
  ==================================================*/


  const sdk = require('@defillama/sdk');
  const abi = require('./abi.json');
  const BigNumber = require("bignumber.js");

/*==================================================
  Settings
  ==================================================*/

  const bTvlAddress = '0x60312e01A2ACd1Dac68838C949c1D20C609B20CF';
  const bcdpmanagerAddress = '0x3f30c2381CD8B917Dd96EB2f1A4F96D91324BBed';
  const ethIlk = '0x4554482d41000000000000000000000000000000000000000000000000000000';
  const mFirstBlock = 11257606
  const cFirstBlock = 11935020
  const lFirstBlock = 12934992
  const registryAddress = "0xbf698df5591caf546a7e087f5806e216afed666a";
  const comptrollerAddress = "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B";
  const bKeeperAddress = "0xeaE019ef845A4Ffdb8829210De5D30aC6FbB5371";
  const stabilityPoolAddress = "0x66017D22b0f8556afDd19FC67041899Eb65a21bb";

  const usdcEth = ADDRESSES.ethereum.USDC
  const usdcFantom = ADDRESSES.fantom.USDC
  const usdcArbitrum = ADDRESSES.arbitrum.USDC
  
  const daiEth = ADDRESSES.ethereum.DAI
  const daiFantom = ADDRESSES.fantom.DAI
  
  const usdtEth = ADDRESSES.ethereum.USDT
  const usdtArbitrum = ADDRESSES.arbitrum.USDT

  const fraxEth = ADDRESSES.ethereum.FRAX
  
  const usdcFantomBAMM = "0xEDC7905a491fF335685e2F2F1552541705138A3D"
  const daiFantomBAMM = "0x6d62d6Af9b82CDfA3A7d16601DDbCF8970634d22"
  const usdcArbitrumBAMM = "0x04208f296039f482810B550ae0d68c3E1A5EB719"
  const usdtArbitrumBAMM = "0x24099000AE45558Ce4D049ad46DDaaf71429b168"

  const hDAIPolygon = "0xE4e43864ea18d5E5211352a4B810383460aB7fcC"
  const hUSDCPolygon = "0x607312a5C671D0C511998171e634DE32156e69d0"
  const hUSDTPolygon = "0x103f2CA2148B863942397dbc50a425cc4f4E9A27"
  const hFRAXPolygon = "0x2c7a9d9919f042C4C120199c69e126124d09BE7c"   
  
  const bammDAIPolygon = "0x998Bf304Ce9Cb215F484aA39d1177b8210078f49"
  const bammUSDCPolygon = "0x0F0dD66D2d6c1f3b140037018958164c6AB80d56"
  const bammUSDTPolygon = "0x1EcF1b0DE9b4c2D01554062eA2faB84b1917B41d"
  const bammFRAXPolygon = "0x2DA13538056aFf0bFC81d3A4c6364B0a7e0f9feb"

  const polygonHTokens = [hDAIPolygon, hUSDCPolygon, hUSDTPolygon, hFRAXPolygon]
  const polygonBamms = [bammDAIPolygon, bammUSDCPolygon, bammUSDTPolygon, bammFRAXPolygon]
  const polygonEthUnderlying = [daiEth, usdcEth, usdtEth, fraxEth]

/*==================================================
  TVL
  ==================================================*/

  async function compoundTvl(timestamp, block) {
    if (block < cFirstBlock) return { [ADDRESSES.null]: '0' };

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
          ? { output: ADDRESSES.null } // ETH has no underlying asset on Compound
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
    if (block < mFirstBlock) return { [ADDRESSES.null]: '0' };

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
    const balances = { [ADDRESSES.null]: totalBalance.toString(10) };

    return balances
  }

  async function liquityTvl(timestamp, block) {
    if (block < lFirstBlock) return { [ADDRESSES.ethereum.LUSD]: '0' };

    let totalBalance = new BigNumber(0);

    for(let i = 0 ; ; i++) {
      try {
        const bamm = await sdk.api.abi.call(
          {
            block,
            target: bKeeperAddress,
            params: [i],
            abi: abi["bamms"]
          });
        const balance = await sdk.api.abi.call(
          {
            block,
            target: stabilityPoolAddress,
            params: [bamm.output],
            abi: abi["getCompoundedLUSDDeposit"]
          });

          totalBalance = totalBalance.plus(new BigNumber(balance.output));
      }
      catch {
        break;
      }
    }

    // all balance is lusd
    return {[ADDRESSES.ethereum.LUSD]: totalBalance.toString(10)}
  }

  async function tvlEth(timestamp, block) {
    const [cTvl, mTvl, lTvl] = await Promise.all([compoundTvl(timestamp, block), makerTvl(timestamp, block), liquityTvl(timestamp, block)])
    // combine balances for Maker and Compound B.Protocol's TVL
    const allLendingPlatformBalances = {}
    // all assets in B.Protocol
    const uniq = arry => [... new Set(arry)]
    uniq(Object.keys(cTvl).concat(Object.keys(mTvl)).concat(Object.keys(lTvl))).forEach(asset => {
      allLendingPlatformBalances[asset] = new BigNumber(cTvl[asset] || "0").plus(new BigNumber(mTvl[asset] || "0")).plus(new BigNumber(lTvl[asset] || "0")).toString(10)
    })

    return allLendingPlatformBalances;
  }

  async function tvlFantom(unixTimestamp, ethBlock, chainBlocks) {
    const block = chainBlocks["fantom"]

    const balances = {}

    balances[usdcEth] = (
      await sdk.api.erc20.balanceOf({
        target: usdcFantom,
        owner: usdcFantomBAMM,
        block: block,
        chain: "fantom",
      })
    ).output;

    balances[daiEth] = (
      await sdk.api.erc20.balanceOf({
        target: daiFantom,
        owner: daiFantomBAMM,
        block: block,
        chain: "fantom",
      })
    ).output;    

    return balances
  }

  async function tvlArbitrum(unixTimestamp, ethBlock, chainBlocks) {
    const block = chainBlocks["arbitrum"]

    const balances = {}

    balances[usdcEth] = (
      await sdk.api.erc20.balanceOf({
        target: usdcArbitrum,
        owner: usdcArbitrumBAMM,
        block: block,
        chain: "arbitrum",
      })
    ).output;

    balances[usdtEth] = (
      await sdk.api.erc20.balanceOf({
        target: usdtArbitrum,
        owner: usdtArbitrumBAMM,
        block: block,
        chain: "arbitrum",
      })
    ).output;    

    return balances
  }  

  async function tvlPolygon(unixTimestamp, ethBlock, chainBlocks) {
    const block = chainBlocks["polygon"]

    const balances = {}

    for(let i = 0 ; i < polygonBamms.length ; i++) {
      const balance = await sdk.api.abi.call(
        {
          block,
          target: polygonHTokens[i],
          params: [polygonBamms[i]],
          abi: abi["balanceOfUnderlying"],
          chain: "polygon"
        });
        
      balances[polygonEthUnderlying[i]] = balance.output
    }

    return balances
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    ethereum: {"tvl": tvlEth},
    fantom: {"tvl" : tvlFantom},
    arbitrum: {"tvl" : tvlArbitrum},
    polygon: {"tvl": tvlPolygon}
  };
