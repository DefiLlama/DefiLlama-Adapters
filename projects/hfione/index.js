const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformHecoAddress } = require("../helper/portedTokens");

const vaults = [
  //HT Pool Vault
  "0x3bb01b3ffe14eb791445db60a5b9d35a1db5c58c",
  //USDT Pool Vault
  "0x787ca650e4d6f8f526e5de9f3a1dcca418c34357",
  //HUSD Pool Vault
  "0xf355df843d1e85b92a5906f5252de85477450bf2",
  //BTC Pool Vault
  "0x33a4aa4a56dc114d6244d5c1d19843da4cca1632",
  //ETH Pool Vault
  "0xb112F95e0DAcd611022d394a1D863574A4Ea1d55",
  //BCH Pool Vault
  "0xbd48D5EEF3d59189f1Ed79503B13d8D35a2412a0",
  //LTC Pool Vault
  "0xb759573EC1a528612FcDd8AE6E3d69683eA93832",
  //DOT Pool Vault
  "0x939D10Fd2B751Ff7604527f9Ec99B92A47AAf7F2",
  //HPT Pool Vault
  "0x1153dC180C03eEc583f1d6aaE54082E1D1b99B99",
  //HBO Pool Vault
  "0x989f969D439cbf923632448075fD536A437db08B",
  //HBO-USDT-LP Vault
  "0x1Fd4b2AaD6297f9699Ed3836B9468C3D5dDD7145",
  //HBO-BTC-LP Vault
  "0x1f472C2565a8Ee5959223E31fd2fcDBE57B922a5",
  //HBO-HT-LP Vault
  "0x4a8D5c4f37a35AFA55f9C20D3416EEC5eCf7888f",
  //HBO-HUSD-LP Vault
  "0x426742111B422668a58C30d4cE6E65fA164f3cd0",
  //HFIL Vault
  "0x526F373BF133D6F6A200d415ae29033bE4C7143a",
  //HPT_Plus Vault
  "0x197f2d0d6851A18033a33FB5579351fe7C809529",
  //UNI VAULT
  "0x2B4069be1fb5B1A0215a4D3f6AfEf749c6511Fa5",
  //AAVE VAULT
  "0x48959A255CCD22d9bb960811975364023444d2CD",
];

const daos = [
  //dao2HFI-5 DAO
  "0x3a74C61bc3CcAf6933DAB5E697D526021ac47d56",
  //dao2HFI-30 DAO
  "0x9255c515c67289F8E5c0d39D9279Ce22bB893DEF",
  //dao2HFI-100 DAO
  "0x3f4E7EE1f2c1d602284bc9Aca69035d3Bf04f772",
];

const HFI = "0x98fc3b60ed4a504f588342a53746405e355f9347";

const hecoTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  // staking native tokens
  const totalSupplyD = (
    await sdk.api.abi.multiCall({
      abi: abi.totalSupply,
      calls: daos.map((dao) => ({
        target: dao,
      })),
      chain: "heco",
      block: chainBlocks["heco"],
    })
  ).output.map((bt) => bt.output);

  for (let index = 0; index < daos.length; index++) {
    sdk.util.sumSingleBalance(balances, `heco:${HFI}`, totalSupplyD[index]);
  }

  // VAULTS Part
  const tokens = (
    await sdk.api.abi.multiCall({
      abi: abi.token,
      calls: vaults.map((vault) => ({
        target: vault,
      })),
      chain: "heco",
      block: chainBlocks["heco"],
    })
  ).output.map((t) => t.output);

  const totalSupply = (
    await sdk.api.abi.multiCall({
      abi: abi.totalSupply,
      calls: vaults.map((vault) => ({
        target: vault,
      })),
      chain: "heco",
      block: chainBlocks["heco"],
    })
  ).output.map((bt) => bt.output);

  const lpPositions = [];

  for (let index = 0; index < vaults.length; index++) {
    if (index >= 10 && index <= 13) {
      lpPositions.push({
        token: tokens[index],
        balance: totalSupply[index],
      });
    } else {
      sdk.util.sumSingleBalance(
        balances,
        `heco:${tokens[index]}`,
        totalSupply[index]
      );
    }
  }

  const transformAddress = await transformHecoAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["heco"],
    "heco",
    transformAddress
  );

  return balances;
};

module.exports = {
  heco: {
    tvl: hecoTvl,
  },
  tvl: sdk.util.sumChainTvls([hecoTvl]),
};
