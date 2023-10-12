const sdk = require("@defillama/sdk");

// ████ ABIs ██████████████████████████████████████████████████████████████

const underlyingAssetsBalanceABI = {
  inputs: [],
  name: "underlyingAssetsBalance",
  outputs: [
    {
      internalType: "uint256[]",
      name: "_underlyingAssets",
      type: "uint256[]",
    },
  ],
  stateMutability: "view",
  type: "function",
};

const underlyingAssetsABI = {
  inputs: [
    {
      internalType: "uint256",
      name: "",
      type: "uint256",
    },
  ],
  name: "underlyingAssets",
  outputs: [
    {
      internalType: "address",
      name: "tokenAddress",
      type: "address",
    },
    {
      internalType: "uint256",
      name: "ratio",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "decimals",
      type: "uint256",
    },
  ],
  stateMutability: "view",
  type: "function",
};

// ████ Constants █████████████████████████████████████████████████████████

const VAULT_ADDRESSES = [
  "0x4dfac5dfe92b79cd56614743d29be17f0824f5a6", // ArbiLending Index
  "0x69d2ead28210ef7ed10c43a8aa86e0e756f06a27", // ArbDeFi Index
  "0x95c34a4effc5eef480c65e2865c63ee28f2f9c7e", // Roundtable Index
  "0xe5cd0d83afddf3e3696861df9debbb417c7378b4", // ArbDerivatives Index
];

// ████ TVL Handler ███████████████████████████████████████████████████████

async function vaultGenesisTvl(timestamp, ethBlock, chainBlocks) {
  try {
    const balances = {};

    const CHAIN = "arbitrum";

    for (let vaultGenesisAddress of VAULT_ADDRESSES) {
      const { output: underlyingAssetsBalance } = await sdk.api.abi.call({
        abi: underlyingAssetsBalanceABI,
        chain: CHAIN,
        target: vaultGenesisAddress,
        block: chainBlocks[CHAIN],
      });

      console.log({
        vaultGenesisAddress,
        underlyingAssetsBalance: underlyingAssetsBalance,
      });

      for (let i = 0; i < underlyingAssetsBalance.length; i++) {
        const {
          output: { tokenAddress },
        } = await sdk.api.abi.call({
          abi: underlyingAssetsABI,
          chain: CHAIN,
          target: vaultGenesisAddress,
          params: [i],
          block: chainBlocks[CHAIN],
        });

        const collateralBalance = underlyingAssetsBalance[i];

        sdk.util.sumSingleBalance(
          balances,
          `${CHAIN}:${tokenAddress}`,
          collateralBalance
        );
      }
    }

    return balances;
  } catch (err) {
    throw err;
  }
}

// ████ Module Exports ████████████████████████████████████████████████████

module.exports = vaultGenesisTvl;
