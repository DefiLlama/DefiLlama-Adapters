const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const utils = require("../helper/utils");
const { stakings } = require("../helper/staking");
const { unwrapUniswapLPs, sumTokens, } = require("../helper/unwrapLPs");
const {
  transformPolygonAddress,
  getChainTransform,
  getFixBalances,
} = require("../helper/portedTokens");
const BigNumber = require("bignumber.js");

const vaultsUrl = {
  polygon:
    "https://raw.githubusercontent.com/eepdev/vaults/main/current_vaults.json",
  arbitrum:
    "https://raw.githubusercontent.com/eepdev/vaults/main/arbitrum_vaults.json",
  cronos:
    "https://raw.githubusercontent.com/eepdev/vaults/main/cronos_vaults.json",
};

/*** Polygon Addresses ***/
const stakingContracts_polygon = [
  "0x920f22E1e5da04504b765F8110ab96A20E6408Bd",
];

const vaultAddresses_polygon = ["0xF7661EE874Ec599c2B450e0Df5c40CE823FEf9d3"]; //ADDY/WETH staking contract

const lpAddresses_polygon = ["0xa5bf14bb945297447fe96f6cd1b31b40d31175cb"]; //ADDY/WETH

const ADDY = "0xc3fdbadc7c795ef1d6ba111e06ff8f16a20ea539";

/*** Arbitrum Addresses ***/
const stakingContracts_Arbitrum = [
  "0x097b15dC3Bcfa7D08ea246C09B6A9a778e5b007B",
  "0xc5fFd083B983AAF823a9b485b207F898ed2f32DC",
  "0x9d5d0cb1B1210d4bf0e0FdCC6aCA1583fA48f0fD",
];

const lpAddresses_arbitrum = [];
const ARBY = "0x09ad12552ec45f82bE90B38dFE7b06332A680864"

/*** Cronos Addresses ***/
const stakingContracts_cronos = [
  "0x3f04D6bD50A79c854EF42965471D34E389eB5CDd",
  "0xD4bcCf04a7CA546D3cfC46205AA7C58EB98c7495",
  "0x323663B759567BAf744C182634585F7164c3c442",
];
const CADDY = "0x09ad12552ec45f82be90b38dfe7b06332a680864";

const vaultAddresses_cronos = [
  "0x3a9645ee664DCE6529Af678aaB4fE3AD9d68323f",
  "0x6681EDBf50C0758C719F3024C282de1694807CcB",
];

const lpAddresses_cronos = [
  "0x332937463df26f46a1a715a41205765774beef80", //CADDY-WCRO Cronos
  "0x2a008ef8ec3ef6b03eff10811054e989aad1cf71", //CADDY-WCRO Cronos
];

async function calcPool2(uniVaults, lpAddress, chain, block) {
  const toa = []
  uniVaults.forEach(owner => lpAddress.forEach(lp => toa.push([lp, owner])))
  return sumTokens({}, toa, block, chain, undefined, { resolveLP: true })
}

async function calcPool2_staking_rewards(
  balances,
  uniVaults,
  lpAddress,
  chain,
  transformAddress = (addr) => addr
) {
  let chainBlocks = {};

  const vault_balances = (
    await sdk.api.abi.multiCall({
      chain: chain,
      block: chainBlocks[chain],
      calls: uniVaults.map((vault) => ({
        target: vault,
      })),
      abi: abi.totalSupply, //IStakingRewards.totalSupply()
    })
  ).output.map((val) => val.output);

  const lpPositions = [];

  lpAddress.forEach((lp, idx) => {
    lpPositions.push({
      balance: vault_balances[idx],
      token: lp,
    });
  });

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks[chain],
    chain,
    transformAddress
  );
}

async function pool2Polygon(timestamp, block, chainBlocks) {
  const balances = {};

  const transformAddress = await transformPolygonAddress();
  await calcPool2_staking_rewards(
    balances,
    vaultAddresses_polygon,
    [lpAddresses_polygon[0]],
    "polygon",
    transformAddress
  );
  return balances;
}

async function pool2Cronos(timestamp, block, chainBlocks) {
  return calcPool2(vaultAddresses_cronos, lpAddresses_cronos, "cronos", chainBlocks.cronos);
}

async function polygonTvl(timestamp, block, chainBlocks) {
  return await tvl(timestamp, "polygon", chainBlocks, lpAddresses_polygon);
}

async function arbitrumTvl(timestamp, block, chainBlocks) {
  return await tvl(timestamp, "arbitrum", chainBlocks, lpAddresses_arbitrum);
}

async function cronosTvl(timestamp, block, chainBlocks) {
  return await tvl(timestamp, "cronos", chainBlocks, lpAddresses_cronos);
}

async function valueInGauge(chain, block, GAUGE, HOLDER, transformAddress = (a) => a) {
  // lp token
  let lp_token = (
    await sdk.api.abi.call({
      chain: chain, block: block, target: GAUGE, abi: abi.lp_token,
    })
  ).output;

  // balance of lp token
  const gauge_lp_balance = new BigNumber(
    (await sdk.api.abi.call({ chain: chain, block: block, target: lp_token, abi: abi.balanceOf, params: GAUGE, })
    ).output
  );

  // total supply of lp token
  const lp_total_supply = new BigNumber(
    (await sdk.api.abi.call({ chain: chain, block: block, target: lp_token, abi: abi.totalSupply, })
    ).output
  );

  // balance of gauge
  const holder_gauge_balance = new BigNumber(
    (await sdk.api.abi.call({ chain: chain, block: block, target: GAUGE, abi: abi.balanceOf, params: HOLDER, })
    ).output
  );

  // total supply of gauge
  const gauge_total_supply = new BigNumber(
    (await sdk.api.abi.call({ chain: chain, block: block, target: GAUGE, abi: abi.totalSupply, })
    ).output
  );

  // calc the portion of curve lp locked in the strategy
  let poolCoins = await crvPoolTvl(chain, block, lp_token, transformAddress);
  for (const coinQty in poolCoins) {
    poolCoins[coinQty] = new BigNumber(poolCoins[coinQty]).times(gauge_lp_balance).dividedBy(lp_total_supply).times(holder_gauge_balance).dividedBy(gauge_total_supply).toFixed(0);
  }

  return poolCoins;
}

async function crvPoolTvl(chain, block, COIN_TARGET, transformAddress = (a) => a, SUPPLY_TARGET = COIN_TARGET) {
  const balances = {};
  const maincoins = [];

  // find coins in curve pool
  for (var c = 0; c < 10; c++) {
    try {
      var coinX = await sdk.api.abi.call({
        chain: chain,
        block: block,
        target: COIN_TARGET,
        abi: abi.coins,
        params: c,
      });
      maincoins.push(coinX.output);
    } catch (error) {
      break;
    }
  }

  // find balances of coins
  const underlying_balances = (
    await sdk.api.abi.multiCall({
      chain: chain,
      block: block,
      calls: maincoins.map((coin) => ({
        target: coin,
        params: SUPPLY_TARGET,
      })),
      abi: abi.balanceOf,
    })
  ).output.map((val) => new BigNumber(val.output));

  // add up total pool tvl
  for (let j = 0; j < maincoins.length; j++) {
    sdk.util.sumSingleBalance(balances, transformAddress(maincoins[j]), underlying_balances[j].toFixed(0));
  }

  return balances;
}

async function curveTvl(balances, chain, block, curveVaults, transformAddress = (a) => a) {
  let crv3Address;

  if (chain == "arbitrum") {
    crv3Address = "0x7f90122BF0700F9E7e1F688fe926940E8839F353";
  } else if (chain == "polygon") {
    // this is actually 2crv not 3crv
    crv3Address = "0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171";
  }

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

    for (var c = 0; c < 10; c++) {
      try {
        var coinX = await sdk.api.abi.call({
          chain: chain,
          block: block,
          target: strat_minters[i],
          abi: abi.coins,
          params: c,
        });
        if (coinX.output === "0x7f90122BF0700F9E7e1F688fe926940E8839F353") {
          coinX.output = "0xbF7E49483881C76487b0989CD7d9A8239B20CA41"; // gauge
        }
        maincoins.push(coinX.output);
      } catch {
        break;
      }
    }

    if (maincoins.length == 0) {
      continue;
    }

    const underlying_balances = (
      await sdk.api.abi.multiCall({
        chain: chain,
        block: block,
        calls: maincoins.map((coin) => ({
          target: coin,
          params: strat_minters[i],
        })),
        abi: abi.balanceOf,
      })
    ).output.map((val) =>
      new BigNumber(val.output)
        // only want the portion locked in adamant
        .times(strat_balances[i])
        .dividedBy(strat_supplies[i])
    );

    for (let j = 0; j < maincoins.length; j++) {
      sdk.util.sumSingleBalance(
        balances,
        await transformAddress(maincoins[j]),
        underlying_balances[j].toFixed(0)
      );
    }

    if (i == curveVaults.length - 1) {
      if (chain == "arbitrum") {
        // I know that this guaged pool wont add up properly, so do it manually
        /*
        balances = join(balances, await 
          valueInGauge(chain, block, "0xbf7e49483881c76487b0989cd7d9a8239b20ca41", 
          "0x30dF229cefa463e991e29D42DB0bae2e122B2AC7", transformAddress));
          */
      }

      // lastly, break down any 3crv / 2crv
      // if (`${chain}:${crv3Address}` in balances) {
        //strat_balances.push(new BigNumber(balances[`${chain}:${crv3Address}`]));
      // } else {
        //return balances;
      // }
    }
  }

  const crv2 = "arbitrum:0xbF7E49483881C76487b0989CD7d9A8239B20CA41";
  sdk.util.sumSingleBalance(
    balances,
    "0x6b175474e89094c44da98b954eedeac495271d0f",
    balances[crv2] ?? "0"
  );
  delete balances[crv2];
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
}

async function uniTvl(balances, chain, block, uniVaults, lpAddressesIgnored, transformAddress = (a) => a) {
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
    if (
      lpAddressesIgnored.some(
        (addr) => addr.toLowerCase() === v.lpAddress.toLowerCase()
      )
    ) {
    } else {
      lpPositions.push({
        balance: vault_balances[idx],
        token: v.lpAddress,
      });
    }
  });

  await unwrapUniswapLPs(balances, lpPositions, block, chain, transformAddress);
  return balances;
}

const tvl = async (timestamp, chain, chainBlocks, lpAddressesIgnored) => {
  const block = chainBlocks[chain];
  const transformAddress = await getChainTransform(chain)
  const fixBalances = await getFixBalances(chain)
  let balances = {};

  let resp = await utils.fetchURL(vaultsUrl[chain]);

  let curveVaults = resp.data
    .filter((vault) => vault.platform.toLowerCase() == "curve" || vault.poolName.toLowerCase() === 'mai-3crv')
    .map((vault) => ({
      vaultAddress: vault.vaultAddress,
      lpAddress: vault.lpAddress,
      strategyAddress: vault.strategyAddress,
    }));
  balances = await curveTvl(balances, chain, block, curveVaults, transformAddress);

  let uniVaults = resp.data
    .filter(
      (vault) =>
        vault.token0 !== vault.token1 &&
        vault.vaultAddress !== "" &&
        vault.platform !== "dodo" &&
        vault.poolName.toLowerCase() !== 'mai-3crv'
    )
    .map((vault) => ({
      vaultAddress: vault.vaultAddress,
      lpAddress: vault.lpAddress,
    }));
  balances = await uniTvl(balances, chain, block, uniVaults, lpAddressesIgnored, transformAddress);

  fixBalances(balances)
  return balances;
};

module.exports = {
  polygon: {
    staking: stakings(stakingContracts_polygon, ADDY, "polygon"),
    pool2: pool2Polygon,
    tvl: polygonTvl,
  },
  arbitrum: {
    staking: stakings(stakingContracts_Arbitrum, ARBY, "arbitrum"),
    tvl: arbitrumTvl,
  },
  cronos: {
    staking: stakings(stakingContracts_cronos, CADDY, "cronos"),
    pool2: pool2Cronos,
    tvl: cronosTvl,
  },
  methodology:
    "The current vaults on Adamant Finance are found on the Github. Once we have the vaults, we filter out the LP addresses of each vault and unwrap the LPs so that each token can be accounted for. Coingecko is used to price the tokens and the sum of all tokens is provided as the TVL",
};
