const sdk = require("@defillama/sdk");
const { getBlock } = require("../helper/getBlock");
const { staking } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { transformHarmonyAddress } = require("../helper/portedTokens");

const bscTem = "0x19e6BfC1A6e4B042Fb20531244D47E252445df01";
const bscStaking = "0xa1f61Ca61fe8655d2a204B518f6De964145a9324";
const bscTreasuryContract = "0xd01e8D805BB310F06411e70Fd50eB58cAe2B4C27";

async function bscTvl(timestamp, block, chainBlocks) {
  let balances = {};
  await sumTokensAndLPsSharedOwners(
    balances,
    [
      ["0xe9e7cea3dedca5984780bafc599bd69add087d56", false], // BUSD
      ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", false], // WBNB
      ["0xfe19f0b51438fd612f6fd59c1dbb3ea319f433ba", false], // MIM
      ["0x9911e98974d0badde85bd5f4d1f93087aa3ec5fa", true], // MIM-BUSD CAKELP
      ["0xbf598a387c5f96f8bac9bdccf8fb68bc189cdff7", true], // TEM-MIM CAKELP
      ["0x1ede821daade714edade648f525ada0c5fe4ee3a", true], // TEM-BUSD CAKELP
    ],
    [bscTreasuryContract],
    chainBlocks.bsc,
    "bsc",
    (addr) => {
      if (addr.toLowerCase() === "0xfe19f0b51438fd612f6fd59c1dbb3ea319f433ba") {
        return "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3";
      }
      return `bsc:${addr}`;
    }
  );
  return balances;
}

const moonriverTem = "0xD86E3F7B2Ff4e803f90c799D702955003bcA9875";
const moonriverStaking = "0xa1f61Ca61fe8655d2a204B518f6De964145a9324";
const moonriverTreasuryContract = "0xd01e8D805BB310F06411e70Fd50eB58cAe2B4C27";

async function moonriverTvl(timestamp, block, chainBlocks) {
  let balances = {};
  await sumTokensAndLPsSharedOwners(
    balances,
    [
      ["0x5eF6e7e82b2402d354a22a0714299920135B45bE", true], // temMim HBLP
      ["0x0cae51e1032e8461f4806e26332c030e34de3adb", false], // MIM
      ["0xca2915886D7893A6F36a3DB44484BA0bF610B465", false], // WMOVR
    ],
    [moonriverTreasuryContract],
    chainBlocks.moonriver,
    "moonriver",
    (addr) => {
      if (addr.toLowerCase() === "0xd86e3f7b2ff4e803f90c799d702955003bca9875") {
        return "bsc:0x19e6BfC1A6e4B042Fb20531244D47E252445df01";
      }
      return `moonriver:${addr}`;
    }
  );
  return balances;
}

const harmonyTem = "0xd754ae7bb55fEB0c4BA6bC037b4A140f14ebE018";
const harmonyStaking = "0xD86E3F7B2Ff4e803f90c799D702955003bcA9875";
const harmonyTreasuryContract = "0x92Ae908d7bCF891FFA47ae10596e6a66cf43A77A";

async function harmonyTvl(timestamp, block, chainBlocks) {
  let balances = {};
  const transform = await transformHarmonyAddress();
  block = await getBlock(timestamp, "harmony", chainBlocks);
  await sumTokensAndLPsSharedOwners(
    balances,
    [
      ["0xeed838406194feba1bd654cfdf85a941ac0944bc", true], // LPTEM-DAI
      ["0xef977d2f931c1978db5f6747666fa1eacb0d0339", false], // DAI
      ["0xcf664087a5bb0237a0bad6742852ec6c8d69a27a", false], // WONE
    ],
    [harmonyTreasuryContract],
    block,
    "harmony",
    transform
  );

  balances["harmony"] =
    balances["bsc:0xdE976f3344cd9F06E451aF3A94a324afC3E154F4"] / 10 ** 18;
  delete balances["bsc:0xdE976f3344cd9F06E451aF3A94a324afC3E154F4"];

  return balances;
}

module.exports = {
  bsc: {
    tvl: bscTvl,
    staking: staking(bscStaking, bscTem, "bsc"),
  },
  moonriver: {
    tvl: moonriverTvl,
    staking: staking(
      moonriverStaking,
      moonriverTem,
      "moonriver",
      "bsc:0x19e6BfC1A6e4B042Fb20531244D47E252445df01"
    ),
  },
  harmony: {
    tvl: harmonyTvl,
    staking: staking(
      harmonyStaking,
      harmonyTem,
      "harmony",
      "bsc:0x19e6BfC1A6e4B042Fb20531244D47E252445df01"
    ),
  },
};
