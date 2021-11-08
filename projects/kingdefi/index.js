const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { addFundsInMasterChef } = require("../helper/masterchef");
const {
  transformBscAddress,
  transformPolygonAddress,
} = require("../helper/portedTokens");

const masterChefContract_bsc = "0x49A44ea2B4126CC1C53C47Ed7f9a5905Cbecae8d";
//const masterChefContract_bscexp = "0x50302F18132d98ea4B0f7Fd2d98e0B1b5d3a3A60";
const masterChefContract_polygon = "0x445AcaE7E3e6248B9b6ebbb002126211e7836Dd8";

const stakingContract = "0x98F3b99198E164f50272ea5Ba44Ea76B1a439876";
const KRW = "0x1446f3cedf4d86a9399e49f7937766e6de2a3aab";

function calctvl(chain) {
  return async (chainBlocks) => {
    const balances = {};

    const transformAddress_bsc = await transformBscAddress();
    const transformAddress_polygon = await transformPolygonAddress();

    await addFundsInMasterChef(
      balances,
      chain == "bsc" ? masterChefContract_bsc : masterChefContract_polygon,
      chainBlocks[chain],
      chain,
      chain == "bsc" ? transformAddress_bsc : transformAddress_polygon
    );

    return balances;
  };
}

const bscTvl = calctvl("bsc");

const polygonTvl = calctvl("polygon");

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    staking: staking(stakingContract, KRW, "bsc"),
    tvl: bscTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  methodology:
    "We count liquidity on the Farms seccion through MasterChef Contracts; and the staking part separtely",
};
