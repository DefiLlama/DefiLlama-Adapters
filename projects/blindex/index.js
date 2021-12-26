const sdk = require("@defillama/sdk");
const abi = require("../helper/abis/blindex.json");
const { calculateUniTvl } = require("../helper/calculateUniTvl.js");

//-------------------------------------------------------------------------------------------------------------
// How to add a new chain?
// 1. Add it to the chains global array
// 2. create a function to calculate the TVL of the chain (similar to what we did with the 'rskTvl' function)
// 3. Add your new chain to the export module
// 4. Add your new chain to the 'sumChainTvls' function in the export module
//-------------------------------------------------------------------------------------------------------------

// Test on the RSK network:
// Go to @defilama/sdk/build/computetvl/blocks.js and add 'rsk' to the chainsForBlocks array

const chains = {
  rsk: {
    uniswapFactoryAddress: "0x6d0aE8f3da7A451A82B48594E91Bf9d79491971d",
    bdxTokenAddress: "0xb3dd46a470b2c3df15931238c61c49cdf429dd9a", // Must be lower case
    // If a token doesn't exist on CoinGecko, map it to the base token it wrappes
    coingeckoMapping: {
      prefix: "rsk",
      "0x542fda317318ebf1d3deaf76e0b632741a7e677d": "rootstock", // RSK's WRBTC
      "0x1d931bf8656d795e50ef6d639562c5bd8ac2b78f": "ethereum", // RSK's ETHs
    },
  },
};

function mapCoingeckoAddress(chainName, address) {
  let mappedName =
    chains[chainName].coingeckoMapping[address] ||
    chains[chainName].coingeckoMapping[address.toLowerCase()];

  if (!mappedName) {
    const addressPrefix =
      chainName === "ethereum"
        ? ""
        : `${chains[chainName].coingeckoMapping["prefix"]}:`;
    mappedName = `${addressPrefix}${address}`;
  }

  return mappedName;
}

async function getBDStableCollateralBalances(block, chainName, bdstable) {
  const collateralPoolsLength = (
    await sdk.api.abi.call({
      target: bdstable.address,
      abi: abi["getBdStablesPoolsLength"],
      chain: chainName,
      block,
    })
  ).output;

  const bdstableCollateralPools = [];
  for (let index = 0; index < collateralPoolsLength; index++) {
    const poolAddress = (
      await sdk.api.abi.call({
        target: bdstable.address,
        abi: abi["bdstable_pools_array"],
        params: index,
        chain: chainName,
        block,
      })
    ).output;

    bdstableCollateralPools.push(poolAddress);
  }

  const balances = {};

  for (let index = 0; index < bdstableCollateralPools.length; index++) {
    const collateralAddress = await (
      await sdk.api.abi.call({
        target: bdstableCollateralPools[index],
        abi: abi["getBDStablePoolCollateral"],
        chain: chainName,
        block,
      })
    ).output;

    const coingeckoMappedName = mapCoingeckoAddress(
      chainName,
      collateralAddress
    );
    const collateralBalance = await getBalanceOfWithPercision(
      block,
      chainName,
      bdstableCollateralPools[index],
      collateralAddress
    );

    balances[coingeckoMappedName] = balances.hasOwnProperty(coingeckoMappedName)
      ? balances[coingeckoMappedName] + collateralBalance
      : collateralBalance;
  }

  const bdxTokenAddress = chains[chainName].bdxTokenAddress;
  const coingeckoMapBdxAddress = mapCoingeckoAddress(
    chainName,
    bdxTokenAddress
  );

  balances[coingeckoMapBdxAddress] += await getBalanceOfWithPercision(
    block,
    chainName,
    bdstable.address,
    bdxTokenAddress
  );

  return balances;
}

async function getBalanceOfWithPercision(block, chainName, owner, target) {
  let balance = (
    await sdk.api.erc20.balanceOf({
      target,
      owner,
      chain: chainName,
      block,
    })
  ).output;

  const decimals = (await sdk.api.erc20.decimals(target, chainName)).output;
  return balance / 10 ** decimals;
}

function sumBalances(balancesArray) {
  return balancesArray.reduce((balances, singleBalance) => {
    for (const [coingeckoTokenId, amount] of Object.entries(singleBalance)) {
      if (!balances[coingeckoTokenId]) {
        balances[coingeckoTokenId] = 0;
      }

      balances[coingeckoTokenId] += amount;
    }

    return balances;
  }, {});
}

async function uniswapV2Tvl(block, chainName) {
  const rawBalances = await calculateUniTvl(
    (address) => address,
    block,
    chainName,
    chains[chainName].uniswapFactoryAddress,
    0,
    true
  );

  const tokensAddresses = Object.keys(rawBalances);
  const balances = {};

  for (let index = 0; index < tokensAddresses.length; index++) {
    const currentToken = tokensAddresses[index];
    const decimals = (await sdk.api.erc20.decimals(currentToken, chainName))
      .output;

    balances[mapCoingeckoAddress(chainName, currentToken)] =
      rawBalances[currentToken] / 10 ** decimals;
  }

  return balances;
}

async function getAllBDStables(bdxTokenAddress) {
  const bdStables = [];
  const bdstablesLength = (
    await sdk.api.abi.call({
      target: bdxTokenAddress,
      abi: abi["getBdStablesLength"],
      chain: chainName,
      block,
    })
  ).output;

  for (let index = 0; index < bdstablesLength; index++) {
    bdStables.push({
      address: (
        await sdk.api.abi.call({
          target: bdxTokenAddress,
          abi: abi["getBDStable"],
          chain: chainName,
          block,
          params: index,
        })
      ).output,
    });
  }

  return bdStables;
}

async function tvl(chainName, block) {
  const balancesArray = [];

  //=======
  // AMM
  //=======
  // TODO: Making sure also the native token works!!!!!!!!!!!!!!!!!!!!!!!!!!!
  balancesArray.push(await uniswapV2Tvl(block, chainName));

  //===================
  // Collateral
  //===================
  const bdstables = await getAllBDStables(chains[chainName].bdxTokenAddress);
  for (let index = 0; index < bdstables.length; index++) {
    balancesArray.push(
      await getBDStableCollateralBalances(block, chainName, bdstables[index])
    );
  }

  return sumBalances(balancesArray);
}

const rsk = async function rskTvl(timestamp, ethBlock, chainblocks) {
  return tvl("rsk", chainblocks["rsk"]);
};

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "(1) AMM LP pairs - All the liquidity pools from the Factory address are used to find the LP pairs. (2) Collateral - All the collateral being used to support the stable coins - Bitcoin, Ethereum & BDX",
  rsk: {
    tvl: rsk,
  },
  tvl: sdk.util.sumChainTvls([rsk]),
};
