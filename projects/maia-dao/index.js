const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const sdk = require('@defillama/sdk')

const MaiaStaking = "0xE2546b144eFc3F8bd85d84b6CA64cC4F033c9be1"
const maia = "0x72c232D56542Ba082592DEE7C77b1C6CFA758BCD"

// https://app.wonderland.money/#/bonds
const treasury = "0x3D183E4F3EeF0191eCFfaFd7fFC5Df8D38520Fa9"
const dao = "0x77314eAA8D99C2Ad55f3ca6dF4300CFC50BdBC7F"//get Msig
const usdc = "0xEA0415b511A1199F7E0822B8641Ab49A44c74A1d"
const usdt = "0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC"
const wmetis = "0x75cb093E4D61d2A2e65D8e0BBb01DE8d89b53481"

async function tvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const transform = addr => addr.toLowerCase() === "0xEA0415b511A1199F7E0822B8641Ab49A44c74A1d" ? "0xEA0415b511A1199F7E0822B8641Ab49A44c74A1d" : `metis:${addr}`


  await sumTokensAndLPsSharedOwners(
    balances,
    [
    //   [usdc, false]
      [usdt, false],
      [wmetis, false],
      ["0x82758824b93F2648bCC9387878CF443C9c0cB768", true], // MAIA-USDC TLP
      ["0x0a72D3BC826e9c435c6A2e6A59b5A62C372D112A", true], // USDT-USDC TLP
      ["0x27e86d206889198c9B58044b3866fF25AA479be2", true], // WMETIS-USDC TLP
      ["0x12D84f1CFe870cA9C9dF9785f8954341d7fbb249", false], // BUSD
      ["0x420000000000000000000000000000000000000A", false] // ETHER
    ],
    [treasury, dao],
    chainBlocks.metis,
    "metis",
    transform
  );

  return balances;
}
module.exports = {
  metis: {
    tvl,
    staking: staking(MaiaStaking, maia, "metis")
  },
  methodology:
    "Counts tokens on the treasury for tvl and staked MAIA for staking"
};
