const { PublicKey } = require("@solana/web3.js");
const { sumTokens, sumTokens2 } = require("../helper/unwrapLPs");
const { sumUnknownTokens } = require("../helper/unknownTokens");
const { getConnection } = require("../helper/solana");

// Token Addresses
const MainnetGIV = "0x900db999074d9277c5da2a43f252d74366230da0";
const xdaiGIV = "0x4f4f9b8d5b4d0dc10506e5551b0513b61fd59e75";
const optimismGIV = "0x528CDc92eAB044E1E39FE43B9514bfdAB4412B98";
const polygonZKEVMGIV = "0xddAFB91475bBf6210a151FA911AC8fdA7dE46Ec2";
const solanaGIV = "3Xi3EhKjnKAk2KTChzybUSWcLW6eAgTHyotHH1U6sJE1";

// ✅ MAINNET
async function mainnetStaking(ts, block) {
  const balances = {};
  const tokensAndOwners = [
    [GIV, "0x4B9EfAE862a1755F7CEcb021856D467E86976755"], // GIvfarm on Mainnet - Mainnet Liquidity Mining (LM)
  ];
  await sumTokens(balances, tokensAndOwners, block);
  return balances;
}

async function mainnetPools(_, block) {
  const toa = [
    [GIV, "0x6873789a71b18efa98a8e8758a5ea456d70c178f"], // FOX/GIV - Balancer - Owned by Giveth DAO
    [GIV, "0xc763b6b3d0f75167db95daa6a0a0d75dd467c4e1"], // GIV / WETH - Uniswap V3 - Owned by Giveth DAO
    [GIV, "0x7819f1532c49388106f7762328c51eE70EdD134c"], // GIV / WETH - Balancer - Not Owned
  ];
  return sumTokens2({ tokensAndOwners: toa, block });
}

// ✅ GNOSIS (xDAI)
async function stakingXDAI() {
  const balance = await sumUnknownTokens({
    owners: ["0x24F2d06446AF8D6E89fEbC205e7936a602a87b60"], // GIvfarm on Gnosis
    tokens: [xdaiGIV],
    chain: "xdai",
  });
  return balance;
}

async function poolXDAI() {
  const balance = await sumUnknownTokens({
    owners: [
      "0xbf945292dc5cbbc8b742083f87d502699cb27414", // GNO - Balancer - Owned By Giveth DAO
      "0x85dc9beb2571298c9197ec16fafa556a85e41eae", // BRIGTH - Balancer - Owned by Giveth DAO
      "0x08ea9f608656a4a775ef73f5b187a2f1ae2ae10e", // HNY - Honeyswap - Owned By Giveth DAO
      "0xdccAa73705dC7457bcfb3dAFEe529B30920e3008", // GNO - Balancer - Not Owned
      "0xb7189a7ea38fa31210a79fe282aec5736ad5fa57", // xDAI - Honeyswap - Not Owned
      "0x75594f01da2e4231e16e67f841c307c4df2313d1", // FOX - Honeyswap - Not Owned
      "0x55ff0cef43f0df88226e9d87d09fa036017f5586", // WETH - Sushiswap - Not owned
    ],
    tokens: [xdaiGIV],
    chain: "xdai",
  });
  return balance;
}

// ✅ OPTIMISM
async function stakingOptimism() {
  const balance = await sumUnknownTokens({
    owners: ["0x301C739CF6bfb6B47A74878BdEB13f92F13Ae5E7"], // GIvfarm on Optimism
    tokens: [optimismGIV],
    chain: "optimism",
  });
  return balance;
}

async function poolOptimism() {
  const balance = await sumUnknownTokens({
    owners: [
      "0xc2ab457e31c224da284df7afda70c39523df4972", // OP - Velodrome - Owned By Giveth DAO
      "0x165E6DAD9772C8CB44015eDD5bd8b012A84bd276", // USDGLO - Uniswap V3 - Owned By Giveth DAO
      "0x969e1D236289742C9D36eA1c7124cdDb84397772", // DAI - Uniswap V3 - Owned By Giveth DAO
      "0xaac7d612c1f23a45967f772ea587963952cc0b80", // TEC - Velodrome - Owned By Giveth DAO
    ],
    tokens: [optimismGIV],
    chain: "optimism",
  });
  return balance;
}

// ✅ POLYGON ZKEVM
async function stakingPolygonZKEVM() {
  const balance = await sumUnknownTokens({
    owners: ["0xc790f82bf6f8709aa4a56dc11afad7af7c2a9867"], // GIVFarm on Polygon ZKEVM
    tokens: [polygonZKEVMGIV],
    chain: "polygonzk",
  });
  return balance;
}

async function poolPolygonZKEVM() {
  const balance = await sumUnknownTokens({
    owners: [
      "0x50f99d234872d99e4324bd287c50da3317cb3473", // POL - Quickswap - Owned by Owned By Giveth DAO
      "0x30c99b07271d9a7143c324f04c77642262380c88", // WETH - Quickswap - Not owned
    ],
    tokens: [polygonZKEVMGIV],
    chain: "polygonzk",
  });
  return balance;
}

// ✅ SOLANA (Proper Implementation)
async function stakingSolana() {
  const connection = getConnection();
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    new PublicKey("E7yVYRW2HZVXcreRE2asLs4HmtyviGbnnTXTarj7uDjc"), // heeeeerreeeeeeeeeee
    { mint: new PublicKey(solanaGIV) }
  );

  let totalBalance = 0;
  tokenAccounts.value.forEach((account) => {
    totalBalance += Number(account.account.data.parsed.info.tokenAmount.uiAmount);
  });

  return { solana: totalBalance };
}

// ✅ EXPORT ALL TOGETHER (No Duplicate Exports)
module.exports = {
  methodology: "Counts GIV staked in all farms",
  ethereum: {
    tvl: mainnetPools,
    staking: mainnetStaking,
    pool2: mainnetPools,
  },
  xdai: {
    tvl: poolXDAI,
    staking: stakingXDAI,
    pool2: poolXDAI,
  },
  optimism: {
    tvl: poolOptimism,
    staking: stakingOptimism,
    pool2: poolOptimism,
  },
  polygonzk: {
    tvl: poolPolygonZKEVM,
    staking: stakingPolygonZKEVM,
    pool2: poolPolygonZKEVM,
  },
  solana: {
    tvl: stakingSolana,
  },
};
