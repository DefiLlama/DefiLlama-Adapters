const { getObject } = require("../helper/chain/sui");

const TREASURY_CAP_OBJECT_ID =
  "0xed99bfb3ee72cd1eb8be16a562b1f0996a050670e227ee6ebc7b829d935fbb36";
const RCUSD_DECIMALS = 6;

async function suiTvl(api) {
  const treasury = await getObject(TREASURY_CAP_OBJECT_ID);
  const totalSupply = treasury.fields.total_supply.fields.value;

  api.addUSDValue(Number(totalSupply) / 10 ** RCUSD_DECIMALS);
}

module.exports = {
  methodology:
    "TVL represents the total value of assets held within the vault. Each vault token is minted using USDC and appreciates in line with the performance of the underlying asset.",
  sui: {
    tvl: suiTvl,
  },
};
