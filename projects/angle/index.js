const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { getConfig } = require("../helper/cache");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getUniqueAddresses } = require("../helper/tokenMapping");

const {
  TreasuryTokenAddresses,
  governorAddress,
  guardianAddress,
  stablecoins,
} = require("./addresses.js");

const ANGLE = "0x31429d1856ad1377a8a0079410b297e1a9e214c2";
const veANGLE = "0x0C462Dbb9EC8cD1630f1728B2CFD2769d09f0dd5";

const poolManagers_abi = {
  getTotalAsset: "uint256:getTotalAsset",
  token: "address:token",
};

const transmuter_abi = {
  getCollateralList: "address[]:getCollateralList",
};

// get Borrowing module vault managers list
async function getVaultManagersFromAPI(api) {
  let calls = [];
  let result = await getConfig(
    "angle/" + api.chain,
    "https://api.angle.money/v1/vaultManagers?chainId=" + api.chainId
  );

  for (const data of Object.values(result)) {
    const token = data.collateral;
    if (token) calls.push([token, data.address]);
  }
  return calls;
}

/**
 * Returns all collaterals of a transmuter
 * @param api - DefiLlama api
 * @param transmuter - Contract address
 * @param genesis - Timestamp to start getting collaterals from
 * @returns [tokenAddress, ownerAddress]
 */
async function transmuterCollaterals(api, transmuter, genesis) {
  if (api.chain !== "ethereum") return []
  if (api.timestamp <= genesis) return []

  const collaterals = await api.call({
    abi: transmuter_abi["getCollateralList"],
    target: transmuter,
  })

  return collaterals.map((collateral, i) => [collateral, transmuter])
}

async function tvl(api) {
  const chain = api.chain;

  const balances = {};
  const tokensAndOwners = [];
  if (chain === "ethereum") {
    const agEUR = {
      contract: "0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8",
      stableMasterFront: "0x5adDc89785D75C86aB939E9e15bfBBb7Fc086A87",
      poolManagers: {
        dai: "0xc9daabC677F3d1301006e723bD21C60be57a5915", // DAI
        fei: "0x53b981389Cfc5dCDA2DC2e903147B5DD0E985F44", // FEI
        frax: "0x6b4eE7352406707003bC6f6b96595FD35925af48", // FRAX
        weth: "0x3f66867b4b6eCeBA0dBb6776be15619F73BC30A2", // WETH
      },
      transmuter: "0x00253582b2a3FE112feEC532221d9708c64cEFAb",
    };

    // count the USDC in pool manager contract
    tokensAndOwners.push([
      ADDRESSES.ethereum.USDC,
      "0xe9f183FC656656f1F17af1F2b0dF79b8fF9ad8eD",
    ]); // add USDC in USDC manager
    const poolManagers = getUniqueAddresses(
      [agEUR].map((i) => Object.values(i.poolManagers)).flat()
    );

    let assets = await api.multiCall({
      calls: poolManagers,
      abi: poolManagers_abi["getTotalAsset"],
    });
    let tokens = await api.multiCall({
      calls: poolManagers,
      abi: poolManagers_abi["token"],
    });

    assets.forEach((output, i) =>
      sdk.util.sumSingleBalance(balances, tokens[i], output)
    );

    // AMOs
    const EUROC = "0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c";
    const curvePool = "0xBa3436Fd341F2C8A928452Db3C5A3670d1d5Cc73";
    const sdagEUREUROC = "0x63f222079608EEc2DDC7a9acdCD9344a21428Ce7";
    const cvxagEUREUROCstaker = "0xA91fccC1ec9d4A2271B7A86a7509Ca05057C1A98";
    const AngleagEUREUROCStaker = "0xC1e8Dba1cbF29f1CaA8343CAe96d5AdFD9bca736";
    // pool TVL
    const [
      agEurBal,
      eurocBal,
      totPoolTokenSupply,
      sdagEUREUROCTVL,
      cvxagEUREUROCstakerTVL,
    ] = await Promise.all([
      api.call({
        abi: "erc20:balanceOf",
        target: agEUR.contract,
        params: curvePool,
      }),
      api.call({ abi: "erc20:balanceOf", target: EUROC, params: curvePool }),
      api.call({ abi: "erc20:totalSupply", target: curvePool }),
      // Angle holdings of Curve agEUREUROC LP tokens (staked on Stake DAO and Convex)
      api.call({
        abi: "erc20:balanceOf",
        target: sdagEUREUROC,
        params: AngleagEUREUROCStaker,
      }),
      api.call({
        abi: "erc20:balanceOf",
        target: cvxagEUREUROCstaker,
        params: AngleagEUREUROCStaker,
      }),
    ]);
    const eurocBalance =
      (eurocBal * (+sdagEUREUROCTVL + +cvxagEUREUROCstakerTVL)) /
      totPoolTokenSupply;
    sdk.util.sumSingleBalance(balances, EUROC, eurocBalance);

    //Fetch all collaterals from transmuters
    const transmutersCollaterals = (
      await Promise.all(
        stablecoins.map(({ transmuter, genesis }) =>
          transmuterCollaterals(api, transmuter, genesis)
        )
      )
    ).flat(1)

    transmutersCollaterals.forEach((v) => tokensAndOwners.push(v));
  }

  // Borrowing module
  tokensAndOwners.push(...(await getVaultManagersFromAPI(api)));

  // Treasury - Governor
  const governorTokens = TreasuryTokenAddresses["governor"][chain];
  governorTokens.forEach((token) => {
    tokensAndOwners.push([token, governorAddress[chain]]);
  });

  // Treasury - Guardian
  const guardianTokens = TreasuryTokenAddresses["guardian"][chain];
  guardianTokens.forEach((token) => {
    tokensAndOwners.push([token, guardianAddress[chain]]);
  })

  // Treasury - Stablecoins
  stablecoins
    .map(({ treasury, treasuryTokens }) =>
      treasuryTokens?.[chain]?.map((token) => [token, treasury])
    )
    .flat(1).forEach((tokenAndOwner) => tokensAndOwners.push(tokenAndOwner))

  return sumTokens2({
    api,
    balances,
    tokensAndOwners,
  });
}

/*
New networks will need to be added progressively. 
If not, the API call defaults to mainnet and the blockchain calls fail and return an error. 
*/

module.exports = {
  hallmarks: [
    [Math.floor(new Date("2023-03-13") / 1e3), "Euler was hacked"],
    [Math.floor(new Date("2023-08-02") / 1e3), "Migration to v2 (Transmuter)"],
    [Math.floor(new Date("2024-03-14") / 1e3), "Rebrading of agEUR to EURA"],
  ],
  ethereum: {
    staking: staking(veANGLE, ANGLE),
  },
  methodology: `TVL is retrieved on-chain by getting the total assets managed by the Transmuter, the balances of the vaultManagers of the Borrowing module and of the governance addresses of the protocol.`,
};

[
  "ethereum",
  "polygon",
  "optimism",
  "arbitrum",
  "avax",
  "celo",
  "bsc",
  "xdai",
].forEach((chain) => {
  if (!module.exports[chain]) module.exports[chain] = {};
  module.exports[chain].tvl = tvl;
});
