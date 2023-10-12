const sdk = require("@defillama/sdk");

// ████ ABIs ██████████████████████████████████████████████████████████████

const singleVaultABI = {
  assetBalance: {
    inputs: [],
    name: "assetBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
};

// ████ Constants █████████████████████████████████████████████████████████

const VAULT = [
  {
    vaultAddress: "0x89e06Baa8E09Bf943a767788Cf00C9f9e9a873d9",
    assetAddress: "0x5402B5F40310bDED796c7D0F3FF6683f5C0cFfdf",
  },
  {
    vaultAddress: "0x9F7323E95F9ee9f7Ec295d7545e82Cd93fA13f97",
    assetAddress: "0x7CbaF5a14D953fF896E5B3312031515c858737C8",
  },
  {
    vaultAddress: "0xE990f7269E7BdDa64b947C81D69aed92a68cEBC6",
    assetAddress: "0x08a152834de126d2ef83D612ff36e4523FD0017F",
  },
  {
    vaultAddress: "0xEb6c9C35f2BBeeDd4CECc717a869584f85C17d67",
    assetAddress: "0x14FbC760eFaF36781cB0eb3Cb255aD976117B9Bd",
  },
  {
    vaultAddress: "0x3DAe492145e0631D341617bAA81a4c72C2CD4b99",
    assetAddress: "0x371c7ec6D8039ff7933a2AA28EB827Ffe1F52f07",
  },
  {
    vaultAddress: "0xdfD0a93a22CAE02C81CCe29A6A6362Bec2D2C282",
    assetAddress: "0x96E1301bd2536A3C56EBff8335FD892dD9bD02dC",
  },
  {
    vaultAddress: "0xF45A9E3f2F5984BaB983C9f245204DE23aE3b1A1",
    assetAddress: "0x55ADE3B74abef55bF379FF6Ae61CB77a405Eb4A8",
  },
  {
    vaultAddress: "0xdEa0521671A86922B69D4fe851A5Adf47f29d412",
    assetAddress: "0x7b571111dAFf9428f7563582242eD29E5949970e",
  },
  {
    vaultAddress: "0x9Ae93cb28F8A5e6D31B9F9887d57604B31DcC42E",
    assetAddress: "0x1ca530f02DD0487cef4943c674342c5aEa08922F",
  },
  {
    vaultAddress: "0xe4a286bCA6026CccC7D240914c34219D074F4020",
    assetAddress: "0xC5b2D9FDa8A82E8DcECD5e9e6e99b78a9188eB05",
  },
  {
    vaultAddress: "0x32d1778be7aF21E956DFA38683a707F5539cFc8c",
    assetAddress: "0x5402B5F40310bDED796c7D0F3FF6683f5C0cFfdf",
  },
  {
    vaultAddress: "0x18dFCCb8EAc64Da10DCc5cbf677314c0125B6C4B",
    assetAddress: "0x068485a0f964B4c3D395059a19A05a8741c48B4E",
  },
  {
    vaultAddress: "0x52459E1FA6E71BCB93C84c2e2b438ED797A8F3a8",
    assetAddress: "0x5A572B5fBBC43387B5eF8de2C4728A4108ef24a6",
  },
  {
    vaultAddress: "0xc994bC98251E043D4681Af980b1E487CfC88193a",
    assetAddress: "0x9A592B4539E22EeB8B2A3Df679d572C7712Ef999",
  },
  {
    vaultAddress: "0xfc0D36C2781F26377da6b72Ab448F5b2a71e7D14",
    assetAddress: "0x08a152834de126d2ef83D612ff36e4523FD0017F",
  },
  {
    vaultAddress: "0xA92c3927A69cBb48735DE6aBf477ea5281152Ef3",
    assetAddress: "0x14FbC760eFaF36781cB0eb3Cb255aD976117B9Bd",
  },
];

// ████ TVL Handler ███████████████████████████████████████████████████████

async function singleVaultTvl(timestamp, ethBlock, chainBlocks) {
  try {
    const balances = {};

    const block = chainBlocks["arbitrum"];

    for (let { vaultAddress, assetAddress } of VAULT) {
      const { output: assetBalance } = await sdk.api.abi.call({
        abi: singleVaultABI.assetBalance,
        chain: "arbitrum",
        target: vaultAddress,
        block: block,
      });

      sdk.util.sumSingleBalance(
        balances,
        `arbitrum:${assetAddress}`,
        assetBalance
      );
    }

    return balances;
  } catch (err) {
    throw err;
  }
}

// ████ Module Exports ████████████████████████████████████████████████████

module.exports = singleVaultTvl;
