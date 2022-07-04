const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { staking } = require("../helper/staking");
const { Contract } = require("ethers");
const fetch = require("node-fetch");

// Registry will be released in next sdk of Angle + graphql endpoint to come
const collaterals = {
  dai: "0x6b175474e89094c44da98b954eedeac495271d0f",
  usdc: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  frax: "0x853d955acef822db058eb8505911ed77f175b99e",
  fei: "0x956F47F50A910163D8BF957Cf5846D573E7f87CA",
  weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
};

const agEUR = {
  contract: "0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8",
  stableMasterFront: "0x5adDc89785D75C86aB939E9e15bfBBb7Fc086A87",
  poolManagers: {
    dai: "0xc9daabC677F3d1301006e723bD21C60be57a5915", // DAI
    usdc: "0xe9f183FC656656f1F17af1F2b0dF79b8fF9ad8eD", // USDC
    fei: "0x53b981389Cfc5dCDA2DC2e903147B5DD0E985F44", // FEI
    frax: "0x6b4eE7352406707003bC6f6b96595FD35925af48", // FRAX
    weth: "0x3f66867b4b6eCeBA0dBb6776be15619F73BC30A2", // WETH
  },
};

const agTokens = [agEUR];

const ANGLE = "0x31429d1856ad1377a8a0079410b297e1a9e214c2";
const veANGLE = "0x0C462Dbb9EC8cD1630f1728B2CFD2769d09f0dd5";

const poolManagers_abi = {
  getTotalAsset: {
    inputs: [],
    name: "getTotalAsset",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
};

// get Borrowing module vault managers list
async function getVaultManagersFromAPI(chain) {
  let chainId;
  if (chain == "ethereum") {
    chainId = 1;
  } else if (chain == "polygon") {
    chainId = 137;
  } else if (chain == "optimism") {
    chainId = 10;
  } else if (chain == "arbitrum") {
    chainId = 42161;
  } else if (chain == "fantom") {
    chainId = 250;
  } else if (chain == "avalanche") {
    chainId = 42161;
  }
  let result;
  let calls = [];
  try {
    result = await (
      await fetch("https://api.angle.money/v1/vaultManagers?chainId=" + chainId)
    ).json();
    const vaultManagersList = Object.keys(result);
    for (const vaultManager of vaultManagersList) {
      calls.push({
        target: result[vaultManager]?.collateral,
        params: vaultManager,
      });
    }
    return calls;
  } catch (error) {
    console.error(error);
  }
}

async function tvl(timestamp, block, chainBlocks, chain) {
  // Core module
  const poolManagersBalanceOf_calls = agTokens
    .map((t) => {
      return Object.entries(t.poolManagers).map(([key, value]) => ({
        target: collaterals[key],
        params: value,
      }));
    })
    .flat();

  /*
    // Call erc20:balanceOf only gets available assets and not those lent to strategies
    let collateralBalances = await sdk.api.abi.multiCall({
        calls: poolManagers_calls,
        abi: 'erc20:balanceOf',
        block: chainBlocks['ethereum'],
        chain: 'ethereum'
    })
    //const balances = {}
    //sdk.util.sumMultiBalanceOf(balances, collateralBalances)
    */

  const poolManagersTotalAsset_calls = agTokens
    .map((t) => {
      return Object.entries(t.poolManagers).map(([key, value]) => ({
        target: value,
      }));
    })
    .flat();

  let collateralBalances = await sdk.api.abi.multiCall({
    calls: poolManagersTotalAsset_calls,
    abi: poolManagers_abi["getTotalAsset"],
    block: chainBlocks[chain],
    chain: chain,
  });

  // Borrowing module
  const vaultManagersBalances_call = await getVaultManagersFromAPI(chain);
  let vaultManagersBalances = await sdk.api.abi.multiCall({
    calls: vaultManagersBalances_call,
    abi: "erc20:balanceOf",
    block: chainBlocks[chain],
    chain: chain,
  });

  // Accumulate collateral to balances
  const balances = {};

  // borrowing module TVL (vaultManagers balances)
  vaultManagersBalances.output.forEach((bal) => {
    const token = bal.input.target;

    balances[token] = BigNumber(balances[token] || 0)
      .plus(BigNumber(bal.output))
      .toFixed();
  });

  if (chain == "ethereum") {
    // add Core module TVL (poolManagers total assets)
    collateralBalances.output.forEach((bal) => {
      const token = poolManagersBalanceOf_calls.find(
        (t) => bal.input.target == t.params
      ).target;

      balances[token] = BigNumber(balances[token] || 0)
        .plus(BigNumber(bal.output))
        .toFixed();
    });
  } else {
    // do nothing
  }
  return balances;
}

async function ethTvl(timestamp, block, chainBlocks) {
  // check weird behaviors of these arguments
  return tvl("", "", "ethereum", "ethereum");
}

async function polygonTvl(timestamp, block, chainBlocks) {
  // check weird behaviors of these arguments
  return tvl("", "", "polygon", "polygon");
}

/*
New networks will need to be added progressively. 
If not, the API call defaults to mainnet and the blockchain calls fail and return an error. 
*/

module.exports = {
  ethereum: {
    tvl: ethTvl,
    staking: staking(veANGLE, ANGLE, "ethereum"),
  },
  polygon: {
    tvl: polygonTvl,
  },
  methodology: `TVL is retrieved on-chain by querying the total assets managed by the Core module, and the balances of the vaultManagers of the Borrowing module.`,
};
