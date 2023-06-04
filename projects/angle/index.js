const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { getConfig } = require("../helper/cache");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getUniqueAddresses } = require("../helper/tokenMapping");

const ANGLE = "0x31429d1856ad1377a8a0079410b297e1a9e214c2";
const veANGLE = "0x0C462Dbb9EC8cD1630f1728B2CFD2769d09f0dd5";

const poolManagers_abi = {
  getTotalAsset: "uint256:getTotalAsset",
  token: "address:token",
};

// get Borrowing module vault managers list
async function getVaultManagersFromAPI(chain) {
  const chainIds = {
    ethereum: 1,
    polygon: 137,
    optimism: 10,
    arbitrum: 42161,
    fantom: 250,
    avax: 43114,
  };
  let chainId = chainIds[chain];
  let calls = [];
  let result = await getConfig(
    "angle/" + chain,
    "https://api.angle.money/v1/vaultManagers?chainId=" + chainId
  );

  for (const data of Object.values(result)) {
    const token = data.collateral;
    if (token) calls.push([token, data.address]);
  }
  return calls;
}

async function tvl(_, _1, _2, { api }) {
  const chain = api.chain
  const balances = {};
  const tokensAndOwners = [];
  if (chain === "ethereum") {
    // Registry will be released in next sdk of Angle + graphql endpoint to come
    const agEUR = {
      contract: "0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8",
      stableMasterFront: "0x5adDc89785D75C86aB939E9e15bfBBb7Fc086A87",
      poolManagers: {
        dai: "0xc9daabC677F3d1301006e723bD21C60be57a5915", // DAI
        // usdc: "0xe9f183FC656656f1F17af1F2b0dF79b8fF9ad8eD", // USDC disabled because of EULER hack
        fei: "0x53b981389Cfc5dCDA2DC2e903147B5DD0E985F44", // FEI
        frax: "0x6b4eE7352406707003bC6f6b96595FD35925af48", // FRAX
        weth: "0x3f66867b4b6eCeBA0dBb6776be15619F73BC30A2", // WETH
      },
    };

    // count the USDC in pool manager contract
    tokensAndOwners.push([ADDRESSES.ethereum.USDC, '0xe9f183FC656656f1F17af1F2b0dF79b8fF9ad8eD']) // add USDC in USDC manager
    const poolManagers = getUniqueAddresses([agEUR].map(i => Object.values(i.poolManagers)).flat())

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
    const [agEurBal, eurocBal, totPoolTokenSupply, sdagEUREUROCTVL, cvxagEUREUROCstakerTVL] = await Promise.all([
      api.call({ abi: 'erc20:balanceOf', target: agEUR.contract, params: curvePool }),
      api.call({ abi: 'erc20:balanceOf', target: EUROC, params: curvePool }),
      api.call({ abi: 'erc20:totalSupply', target: curvePool }),
      // Angle holdings of Curve agEUREUROC LP tokens (staked on Stake DAO and Convex)
      api.call({ abi: 'erc20:balanceOf', target: sdagEUREUROC, params: AngleagEUREUROCStaker }),
      api.call({ abi: 'erc20:balanceOf', target: cvxagEUREUROCstaker, params: AngleagEUREUROCStaker }),
    ])
    const eurocBalance = eurocBal * (+sdagEUREUROCTVL + +cvxagEUREUROCstakerTVL) / totPoolTokenSupply
    sdk.util.sumSingleBalance(balances, EUROC, eurocBalance);
  }

  // Borrowing module
  tokensAndOwners.push(...(await getVaultManagersFromAPI(chain)));
  return sumTokens2({ balances, api, tokensAndOwners });
}

/*
New networks will need to be added progressively. 
If not, the API call defaults to mainnet and the blockchain calls fail and return an error. 
*/

module.exports = {
  hallmarks: [
    [Math.floor(new Date('2023-03-13') / 1e3), 'Euler was hacked'],
  ],
  ethereum: {
    staking: staking(veANGLE, ANGLE, "ethereum"),
  },
  methodology: `TVL is retrieved on-chain by querying the total assets managed by the Core module, and the balances of the vaultManagers of the Borrowing module.`,
};

["ethereum", "polygon", "optimism", "arbitrum", "avax"].forEach((chain) => {
  if (!module.exports[chain]) module.exports[chain] = {};
  module.exports[chain].tvl = tvl
});
