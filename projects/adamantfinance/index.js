const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const utils = require("../helper/utils");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformPolygonAddress, transformArbitrumAddress } = require("../helper/portedTokens");
const { getBlock } = require('../helper/getBlock');
const BigNumber = require("bignumber.js");
const vaultsUrl = {
  "polygon": "https://raw.githubusercontent.com/eepdev/vaults/main/current_vaults.json",
  "arbitrum": "https://raw.githubusercontent.com/eepdev/vaults/main/arbitrum_vaults.json"
};

async function polygonTvl(timestamp, block, chainBlocks) {
  const transformAddress = await transformPolygonAddress();
  return await tvl(timestamp, 'polygon', chainBlocks, transformAddress);
};
async function arbitrumTvl(timestamp, block, chainBlocks) {
  const transformAddress = await transformArbitrumAddress();
  return await tvl(timestamp, 'arbitrum', chainBlocks, transformAddress);
};
async function valueInGauge(chain, block, GAUGE, HOLDER, transformAddress=a=>a) {

  // lp token 
  let lp_token = (
    await sdk.api.abi.call({
      chain: chain,
      block: block,
      target: GAUGE,
      abi: abi.lp_token,
    })
  ).output;

  // balance of lp token
  const gauge_lp_balance = new BigNumber((
    await sdk.api.abi.call({
      chain: chain,
      block: block,
      target: lp_token,
      abi: abi.balanceOf,
      params: GAUGE
    })
  ).output);

  // total supply of lp token 
  const lp_total_supply = new BigNumber((
    await sdk.api.abi.call({
      chain: chain,
      block: block,
      target: lp_token,
      abi: abi.totalSupply,
    })
  ).output);

  // balance of gauge 
  const holder_gauge_balance = new BigNumber((
    await sdk.api.abi.call({
      chain: chain,
      block: block,
      target: GAUGE,
      abi: abi.balanceOf,
      params: HOLDER
    })
  ).output);

  // total supply of gauge
  const gauge_total_supply = new BigNumber((
    await sdk.api.abi.call({
      chain: chain,
      block: block,
      target: GAUGE,
      abi: abi.totalSupply,
    })
  ).output);

  // calc the portion of curve lp locked in the strategy
  let poolCoins = await crvPoolTvl(chain, block, lp_token, transformAddress);
  for (const coinQty in poolCoins) {
    poolCoins[coinQty] = (new BigNumber(poolCoins[coinQty])
    .times(gauge_lp_balance).dividedBy(lp_total_supply)
    .times(holder_gauge_balance).dividedBy(gauge_total_supply)).toFixed(0);
  };

  return poolCoins;
};
async function crvPoolTvl(chain, block, COIN_TARGET, transformAddress=a=>a, SUPPLY_TARGET=COIN_TARGET) {
  balances = {};
  maincoins = [];

  // find coins in curve pool
  for(var c = 0; c < 10; c++){
    try {
      var coinX = await sdk.api.abi.call({
        chain: chain,
        block: block,
        target: COIN_TARGET,
        abi: abi.coins,
        params: c
      });
      maincoins.push(coinX.output);
    } catch (error) { break; };
  };

  // find balances of coins
  const underlying_balances = (
    await sdk.api.abi.multiCall({
      chain: chain,
      block: block,
      calls: maincoins.map((coin) => ({
        target: coin,
        params: SUPPLY_TARGET
      })),
      abi: abi.balanceOf,
    })
  ).output.map((val) => new BigNumber(val.output));

  // add up total pool tvl 
  for (j = 0; j < maincoins.length; j++) {
    sdk.util.sumSingleBalance(balances, transformAddress(maincoins[j]), 
      (underlying_balances[j].toFixed(0)));
  };

  return balances;
};
function join(obj1, obj2){
  // joins 2 balances objects
  var a = {};

  for (var i in obj1) {
    a[i] = obj1[i];
  }

  for (var j in obj2) {
    if (j in a) {
      a[j] = BigNumber(a[j]) + BigNumber(obj2[j])

    } else {
      a[j] = obj2[j];
    }
  }
  return a;
};
async function curveTvl(balances, chain, block, curveVaults, transformAddress=a=>a) {
  let crv3Address;

  if (chain == 'arbitrum') {
    crv3Address = "0x7f90122BF0700F9E7e1F688fe926940E8839F353";
  } else if (chain == 'polygon') {
    // this is actually 2crv not 3crv
    crv3Address = '0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171';
  };

  let strat_balances = (
    await sdk.api.abi.multiCall({
      chain: chain,
      block: block,
      calls: curveVaults.map((vault) => ({
        target: vault.strategyAddress,
      })),
      abi: abi.balanceOfVault,
    })
  ).output.map((val) => new BigNumber(val.output));

  let strat_minters = (
    await sdk.api.abi.multiCall({
      chain: chain,
      block: block,
      calls: curveVaults.map((vault) => ({
        target: vault.lpAddress,
      })),
      abi: abi.minter,
    })
  ).output.map((val) => val.output);
  
  const strat_supplies = (
    await sdk.api.abi.multiCall({
      chain: chain,
      block: block,
      calls: curveVaults.map((vault) => ({
        target: vault.lpAddress,
      })),
      abi: abi.totalSupply,
    })
  ).output.map((val) => new BigNumber(val.output));

  for (var i = 0; i < curveVaults.length; i++) {

    const maincoins = [];

    // if it hasn't got a minter, the balance is probably in the token contract
    if (!strat_minters[i]) {
      strat_minters[i] = curveVaults[i].lpAddress;
    }

    for(var c = 0; c < 10; c++){
      try {
        var coinX = await sdk.api.abi.call({
          chain: chain,
          block: block,
          target: strat_minters[i],
          abi: abi.coins,
          params: c
        });
        if(coinX.output === "0x7f90122BF0700F9E7e1F688fe926940E8839F353"){
          coinX.output = "0xbF7E49483881C76487b0989CD7d9A8239B20CA41" // gauge
        }
        maincoins.push(coinX.output);
      } catch { break; };
    };

    if (maincoins.length == 0) {
      continue;
    }

    const underlying_balances = (
      await sdk.api.abi.multiCall({
        chain: chain,
        block: block,
        calls: maincoins.map((coin) => ({
          target: coin,
          params: strat_minters[i]
        })),
        abi: abi.balanceOf,
      })
    ).output.map((val) => new BigNumber(val.output)
    // only want the portion locked in adamant
    .times(strat_balances[i]).dividedBy(strat_supplies[i]));

    for (j = 0; j < maincoins.length; j++) {
      sdk.util.sumSingleBalance(balances, await transformAddress(maincoins[j]), 
        underlying_balances[j].toFixed(0));
    };

    if (i == curveVaults.length - 1) {
      if (chain == 'arbitrum') {
        // I know that this guaged pool wont add up properly, so do it manually
        /*
        balances = join(balances, await 
          valueInGauge(chain, block, "0xbf7e49483881c76487b0989cd7d9a8239b20ca41", 
          "0x30dF229cefa463e991e29D42DB0bae2e122B2AC7", transformAddress));
          */
      };

      // lastly, break down any 3crv / 2crv
      if (`${chain}:${crv3Address}` in balances) {
        //strat_balances.push(new BigNumber(balances[`${chain}:${crv3Address}`]));
      } else {
        //return balances;
      };
    };
  };

  const crv2 = "arbitrum:0xbF7E49483881C76487b0989CD7d9A8239B20CA41"
  sdk.util.sumSingleBalance(balances, "0x6b175474e89094c44da98b954eedeac495271d0f", balances[crv2] ?? '0')
  delete balances[crv2]
  // something wrong with decimals
  /*
  if (chain == 'arbitrum') {
    balances['0xdAC17F958D2ee523a2206206994597C13D831ec7'] = 
      (balances['0xdAC17F958D2ee523a2206206994597C13D831ec7'] / 10**12).toFixed(0);
    balances['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'] = 
      (balances['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'] / 10**12).toFixed(0);
  }
  */

  return balances;
};
async function uniTvl(balances, chain, block, uniVaults, transformAddress=a=>a) {
  const vault_balances = (
    await sdk.api.abi.multiCall({
      chain: chain,
      block: block,
      calls: uniVaults.map((vault) => ({
        target: vault.vaultAddress,
      })),
      abi: abi.balance,
    })
  ).output.map((val) => val.output);

  const lpPositions = [];

  uniVaults.forEach((v, idx) => {
    lpPositions.push({
      balance: vault_balances[idx],
      token: v.lpAddress,
    });
  });

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    transformAddress
  );
  return balances;
};
const tvl = async (timestamp, chain, chainBlocks, transformAddress=a=>a) => {
  const block = await getBlock(timestamp, chain, chainBlocks);
  let balances = {};

  let resp = await utils.fetchURL(vaultsUrl[chain]);

  let curveVaults = resp.data.filter(
    vault => vault.platform.toLowerCase() == "curve").map((vault) => ({
      vaultAddress: vault.vaultAddress,
      lpAddress: vault.lpAddress,
      strategyAddress: vault.strategyAddress
  }));
  balances = await curveTvl(balances, chain, block, curveVaults, transformAddress);

  let uniVaults = resp.data.filter(
    vault => vault.token0 !== vault.token1 && vault.vaultAddress !== "" 
    && vault.platform !== "dodo").map((vault) => ({
      vaultAddress: vault.vaultAddress,
      lpAddress: vault.lpAddress,
  }));
  balances = await uniTvl(balances, chain, block, uniVaults, transformAddress);

  return balances;
};
module.exports = {
  polygon: {
    tvl: polygonTvl,
  },
  arbitrum: {
    tvl: arbitrumTvl,
  },
  tvl: sdk.util.sumChainTvls([polygonTvl, arbitrumTvl]),
  methodology: 'The current vaults on Adamant Finance are found on the Github. Once we have the vaults, we filter out the LP addresses of each vault and unwrap the LPs so that each token can be accounted for. Coingecko is used to price the tokens and the sum of all tokens is provided as the TVL'
};
