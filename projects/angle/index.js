const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { getConfig } = require("../helper/cache");
const { sumTokens2 } = require("../helper/unwrapLPs");

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

async function tvl(chain, block) {
  const balances = {};
  const tokensAndOwners = [];
  if (chain === "ethereum") {
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
    const tokenMapping = {};
    agTokens.map((t) => {
      return Object.entries(t.poolManagers).forEach(([key, value]) => {
        tokenMapping[value] = collaterals[key];
      });
    });

    let { output: assets } = await sdk.api.abi.multiCall({
      calls: Object.keys(tokenMapping).map((i) => ({ target: i })),
      abi: poolManagers_abi["getTotalAsset"],
      chain,
      block,
    });
    let { output: tokens } = await sdk.api.abi.multiCall({
      calls: Object.keys(tokenMapping).map((i) => ({ target: i })),
      abi: poolManagers_abi["token"],
      chain,
      block,
    });

    assets.forEach(({ output }, i) =>
      sdk.util.sumSingleBalance(balances, tokens[i].output, output)
    );

    // AMOs
    const EUROC = "0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c";
    const curvePool = "0xBa3436Fd341F2C8A928452Db3C5A3670d1d5Cc73";
    const sdagEUREUROC = "0x63f222079608EEc2DDC7a9acdCD9344a21428Ce7";
    const cvxagEUREUROCstaker = "0xA91fccC1ec9d4A2271B7A86a7509Ca05057C1A98";
    const AngleagEUREUROCStaker = "0xC1e8Dba1cbF29f1CaA8343CAe96d5AdFD9bca736";
    // pool TVL
    let agEURTVL = await sdk.api.erc20.balanceOf({
      owner: curvePool,
      target: agEUR.contract,
      block: block,
    });
    let EUROCTVL = await sdk.api.erc20.balanceOf({
      owner: curvePool,
      target: EUROC,
      block: block,
    });
    const totPoolTVL = agEURTVL.output / 10 ** 18 + EUROCTVL.output / 10 ** 6;
    // Angle holdings of Curve agEUREUROC LP tokens (staked on Stake DAO and Convex)
    let sdagEUREUROCTVL = await sdk.api.erc20.balanceOf({
      owner: AngleagEUREUROCStaker,
      target: sdagEUREUROC,
      block: block,
    });
    let cvxagEUREUROCstakerTVL = await sdk.api.erc20.balanceOf({
      owner: AngleagEUREUROCStaker,
      target: cvxagEUREUROCstaker,
      block: block,
    });
    const AnglePoolTVL =
      (Number(sdagEUREUROCTVL.output) + Number(cvxagEUREUROCstakerTVL.output)) /
      10 ** 18;
    let AngleagEURTVL = (AnglePoolTVL / totPoolTVL) * agEURTVL.output;
    let AngleEUROCTVL = (AnglePoolTVL / totPoolTVL) * EUROCTVL.output;

    sdk.util.sumSingleBalance(balances, agEUR.contract, AngleagEURTVL);
    sdk.util.sumSingleBalance(balances, EUROC, AngleEUROCTVL);
  }

  // Borrowing module
  tokensAndOwners.push(...(await getVaultManagersFromAPI(chain)));
  return sumTokens2({ balances, chain, block, tokensAndOwners });
}

/*
async function amos(chain, block) {
  const balances = {};
  const agEUR = "0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8";
  const EUROC = "0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c";
  const curvePool = "0xBa3436Fd341F2C8A928452Db3C5A3670d1d5Cc73";
  const sdagEUREUROC = "0x63f222079608EEc2DDC7a9acdCD9344a21428Ce7";
  const cvxagEUREUROCstaker = "0xA91fccC1ec9d4A2271B7A86a7509Ca05057C1A98";
  const AngleagEUREUROCStaker = "0xC1e8Dba1cbF29f1CaA8343CAe96d5AdFD9bca736";
  // pool TVL
  let agEURTVL = await sdk.api.erc20.balanceOf({
    owner: curvePool,
    target: agEUR,
    block: block,
  });
  let EUROCTVL = await sdk.api.erc20.balanceOf({
    owner: curvePool,
    target: EUROC,
    block: block,
  });
  const totPoolTVL = agEURTVL.output / 10 ** 18 + EUROCTVL.output / 10 ** 6;
  // our TVL
  let sdagEUREUROCTVL = await sdk.api.erc20.balanceOf({
    owner: AngleagEUREUROCStaker,
    target: sdagEUREUROC,
    block: block,
  });
  let cvxagEUREUROCstakerTVL = await sdk.api.erc20.balanceOf({
    owner: AngleagEUREUROCStaker,
    target: cvxagEUREUROCstaker,
    block: block,
  });
  const AnglePoolTVL =
    (Number(sdagEUREUROCTVL.output) + Number(cvxagEUREUROCstakerTVL.output)) /
    10 ** 18;
  let AngleagEURTVL = (AnglePoolTVL / totPoolTVL) * agEURTVL.output;
  let AngleEUROCTVL = (AnglePoolTVL / totPoolTVL) * EUROCTVL.output;
  console.log(AngleagEURTVL, AngleEUROCTVL);
  return AnglePoolTVL;
}
*/

/*
New networks will need to be added progressively. 
If not, the API call defaults to mainnet and the blockchain calls fail and return an error. 
*/

module.exports = {
  ethereum: {
    staking: staking(veANGLE, ANGLE, "ethereum"),
  },
  methodology: `TVL is retrieved on-chain by querying the total assets managed by the Core module, and the balances of the vaultManagers of the Borrowing module.`,
};

["ethereum", "polygon", "optimism", "arbitrum", "avax"].forEach((chain) => {
  if (!module.exports[chain]) module.exports[chain] = {};
  module.exports[chain].tvl = async (_, _b, { [chain]: block }) =>
    tvl(chain, block);
});

/*
amos().then((data) => {
  console.log(data);
});
*/
