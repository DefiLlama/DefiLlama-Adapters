const { getConfig } = require("../helper/cache");
const { staking } = require("../helper/staking");

const lisLPs = [
  "0xe8f4644637f127aFf11F9492F41269eB5e8b8dD2", // Lista LP Stable-LP
  "0xFf5ed1E64aCA62c822B178FFa5C36B40c112Eb00", // Lista LP aSnBNB-WBNB
  "0x4b2D67Bf25245783Fc4C33a48962775437F9159c", // Lista LP aUSDT-LISTA
  "0xC23d348f9cC86dDB059ec798e87E7F76FBC077C1", // Lista LP aHAY-USDT
  "0xF6aB5cfdB46357f37b0190b793fB199D62Dcf504", // Lista LP UV-17-THE
  "0x1Cf9c6D475CdcA67942d41B0a34BD9cB9D336C4d", // Lista LP sAMM-HAY/FRAX
  "0x9eb77a54a33069a319d91f493e6b1c9066fb38f7" // Lista LP pancake lisUSD/USDT
];

const abi = {
  lpToken: "address:lpToken",
  totalSupply: "uint256:totalSupply",
};

const pool2 = async (api) => {
  const [lisLpTokens, lisLpBalances] = await Promise.all([
    api.multiCall({ calls: lisLPs, abi: abi.lpToken }),
    api.multiCall({ calls: lisLPs, abi: abi.totalSupply }),
  ]);

  api.add(lisLpTokens, lisLpBalances)
}

module.exports = {
  methodology: "The TVL is calculated by summing the values of tokens held in the specified vault addresses",
  hallmarks: [
    [1669939200, "aBNBc exploit"],
  ],
  bsc: {
    tvl: async (api) => {
      const { data: tokensAndOwners } = await getConfig('helio/vaults', 'https://api.lista.org/api/defiLlama/cdp-vault-list');
      return api.sumTokens({ tokensAndOwners })
    },
    pool2,
    staking: staking('0xd0C380D31DB43CD291E2bbE2Da2fD6dc877b87b3', '0xFceB31A79F71AC9CBDCF853519c1b12D379EdC46')
  },
};
