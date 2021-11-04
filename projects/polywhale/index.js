const sdk = require("@defillama/sdk");
const { transformPolygonAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { pool2 } = require("../helper/pool2");

const krillToken = "0x05089C9EBFFa4F0AcA269e32056b1b36B37ED71b";
const masterchef = "0x34bc3D36845d8A7cA6964261FbD28737d0d6510f";
const krillUsdcLP = "0x6405Ebc22cB0899FC21f414085Ac4044B4721a0d";

async function tvl(timestamp, chain, chainBlocks) {
  let balances = {};

  const transformAddress = await transformPolygonAddress();
  await addFundsInMasterChef(
    balances,
    masterchef,
    chainBlocks.polygon,
    "polygon",
    transformAddress,
    undefined,
    [krillToken, krillUsdcLP]
  );

  return balances;
}

async function staking(timestamp, chain, chainBlocks) {
  let balances = {};

  let krillBalance = (
    await sdk.api.erc20.balanceOf({
      target: krillToken,
      owner: masterchef,
      block: chainBlocks.polygon,
      chain: "polygon",
    })
  ).output;

  sdk.util.sumSingleBalance(balances, `polygon:${krillToken}`, krillBalance);

  return balances;
}

module.exports = {
  methodology:
    "TVL is calculated by the value locked in the masterchef contracts exluding the staked KRILL and the KRILL-USDC LP",
  polygon: {
    tvl,
    staking,
    pool2: pool2(
      masterchef,
      krillUsdcLP,
      "polygon",
      (addr) => `polygon:${addr}`
    ),
  },
  tvl,
};
