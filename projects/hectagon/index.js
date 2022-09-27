const sdk = require("@defillama/sdk");
const { transformBscAddress } = require("../helper/portedTokens");

const BUSD_ADDRESS = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const HECTA_ADDRESS = "0x343915085b919fbd4414F7046f903d194c6F60EE";
const ASSET_LOCKED_ADDRESS = "0x4059c4a0b8a2B528C4f2E101A3bB8fB169aBa4fB";
const HECTA_BUSD_ADDRESS = "0xc7cee4cea7c76e11e9f5e5e5cbc5e3b798a1c4d0";
const GHECTA_ADDRESS = "0x7D31ed03c2442F9ffc4f22d90772EE1f32fa9b0D";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformBscAddress();

  const [busdBalance, hectaBusdBalance, hectaInGHecta] = await Promise.all([
    sdk.api.abi.call({
      abi: "erc20:balanceOf",
      chain: "bsc",
      target: BUSD_ADDRESS,
      params: [ASSET_LOCKED_ADDRESS],
      block: chainBlocks["bsc"],
    }),
    sdk.api.abi.call({
      abi: "erc20:balanceOf",
      chain: "bsc",
      target: HECTA_BUSD_ADDRESS,
      params: [ASSET_LOCKED_ADDRESS],
      block: chainBlocks["bsc"],
    }),
    sdk.api.abi.call({
      abi: "erc20:balanceOf",
      chain: "bsc",
      target: HECTA_ADDRESS,
      params: [GHECTA_ADDRESS],
      block: chainBlocks["bsc"],
    }),
  ]);

  sdk.util.sumSingleBalance(
    balances,
    transform(BUSD_ADDRESS),
    busdBalance.output
  );

  sdk.util.sumSingleBalance(
    balances,
    transform(HECTA_BUSD_ADDRESS),
    hectaBusdBalance.output
  );

  sdk.util.sumSingleBalance(
    balances,
    transform(HECTA_ADDRESS),
    hectaInGHecta.output
  );

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "Total Value Lock in Hectagon protocol is calculated by sum of: Treasury locked value + staking",
  start: 20195418,
  bsc: {
    tvl,
  },
};
