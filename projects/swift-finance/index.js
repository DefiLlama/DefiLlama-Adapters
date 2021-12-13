const sdk = require("@defillama/sdk");
const { transformAvaxAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { pool2BalanceFromMasterChefExports } = require("../helper/pool2");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const token = "0x0Aa4ef05B43700BF4b6E6Dc83eA4e9C2CF6Af0fA";
const masterchef = "0x9A03B68b86C06f4cf29530a0780D68FBe01E9aC6";
const stakePools = [
    "0x081Ffa6Fa76e738531B3717301F4B636efAe1F1e", // USDC
    "0xa6b73cDFF84e4a6055aC0216054292d470956cc7"  // wAVAX
];
const wEthwAvaxPool = "0xFE15c2695F1F920da45C30AAE47d11dE51007AF9";
const poolInfoAbi = {
  inputs: [
    {
      internalType: "uint256",
      name: "",
      type: "uint256",
    },
  ],
  name: "poolInfo",
  outputs: [
    {
      internalType: "contract IERC20",
      name: "lpToken",
      type: "address",
    },
    {
      internalType: "uint256",
      name: "allocPoint",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "lastRewardBlock",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "accSwiftPerShare",
      type: "uint256",
    },
    {
      internalType: "uint16",
      name: "depositFeeBP",
      type: "uint16",
    },
  ],
  stateMutability: "view",
  type: "function",
};

async function tvl(timestamp, block, chainBlocks) {
    let balances = {};
    const transform = await transformAvaxAddress();
    // addFundsInMasterChef has issues calculating wETH-wAVAX pool TVL so it is ignored and calculated separately
    await addFundsInMasterChef(balances, masterchef, chainBlocks.avax, "avax", transform, poolInfoAbi, [token, wEthwAvaxPool], true, true, token);
    //Calculates wETH-wAVAX TVL
    let lpBalance = (await sdk.api.erc20.balanceOf({
        target: wEthwAvaxPool,
        owner: masterchef,
        block: chainBlocks.avax,
        chain: "avax"
    })).output;
    await unwrapUniswapLPs(balances, [{balance: lpBalance, token: wEthwAvaxPool}], chainBlocks.avax, "avax", transform);

    return balances;
}

async function staking(timestamp, block, chainBlocks) {
    let balances = {};
    let swiftBals = (await sdk.api.abi.multiCall({
        calls: stakePools.map(p => ({
            target: token,
            params: p
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks.avax,
        chain: "avax"
    })).output;
    swiftBals.forEach((_, i) => {
        sdk.util.sumSingleBalance(balances, `avax:${token}`, swiftBals[i].output);
    });
    return balances;
}

module.exports = {
    avax: {
        tvl,
        pool2: pool2BalanceFromMasterChefExports(masterchef, token, "avax", addr=>`avax:${addr}`, poolInfoAbi),
        staking
    },
    tvl
};
