const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const {pool2Exports} = require("../helper/pool2");
const { sumTokensAndLPsSharedOwners, sumTokens } = require("../helper/unwrapLPs");
const {staking} = require("../helper/staking");

const orca = "0x8b1d98a91f853218ddbb066f20b8c63e782e2430";
const podLeader = "0x111E1E97435b57467E79d4930acc4B7EB3d478ad";
const pool2LPs = [
  "0x1A9Bd67c82C0e8E47C3ad2FA772FCb9B7A831A37",
  "0xeD7a2B4054757Cfdb632Af15Ad528624F0fFf3B0",
  "0x73e6CB72a79dEa7ed75EF5eD6f8cFf86C9128eF5"
]

// [[Collateral, Bank]]
const banksAndCollateral = [
  ["0x330cc45c8f60fef7f9d271a7512542b3d201a48d","0x64D56b4B6C844015EC07e52A1267D5d5d4F4E5BD"], // YAK BENQI WBTC
  ["0x9669fe1ea0d8883661289461b90a10b71ae400ee","0xEa03cDCdD912522400d21Ee89A5bC46Bffe11AC3"], // YAK BENQI DAI
  ["0x07b0e11d80ccf75cb390c9be6c27f329c119095a","0xAf8d16500A58b868C34be9106d674b820d67C979"], // YAK BENQI USDT
  [ADDRESSES.avax.WAVAX,"0xC029713E92383426C9b387b124C0BF6271d08b80"], // AVAX
  ["0x8b414448de8b609e96bd63dcf2a8adbd5ddf7fdd","0x2b583646EC93245562Fd08A3b5f44Aa55417766B"], // YAK BENQI AVAX
  ["0x0eac97a78a93b75549d49145df41dbe9cd520874","0xd694F97dd5874fA4e712FDFB781231D93642D29b"], // YAK BENQI USDC
  ["0x957ca4a4aa7cdc866cf430bb140753f04e273bc0","0x8aee038726715d78C49dFb2f12e76DE70C2F48eC"], // YAK AAVE AVAX
  ["0x4084f32a91f4d8636ca08386efe70c6e302f1d84","0x22a86D96b26308ba1971F8080AAD965884061076"], // YAK BENQI LINK
  ["0x7d2d076000611e44740d636843384412399e31b9","0xc59b6794e5DeE450d264669f34e7849A90083774"], // YAK BENQI WETH
  ["0xb634a71a54d3382ff6896eb22244b4a4e54c0a82","0x8b61488Ca2D727826c7Afe4eDbF810159F17D398"], // YAK AAVE WETH
  ["0x3a91a592a06390ca7884c4d9dd4cba2b4b7f36d1","0xa1A34E32c24911daA45e338dB9D785c1b323F280"], // YAK JOE
  ["0x0f7f48d4b66bf5a53d4f21fa6ffca45f70cef770","0x18419976Ba05dd9cE44544B8d91590704aFA4a29"], // YAK AAVE WBTC
  ["0xbf5bffbf7d94d3b29abe6eb20089b8a9e3d229f7","0xC09caDDA753c54292BeB1D10429bD175556b8b5E"], // YAK QI
  [ADDRESSES.avax.WETH_e,"0x4805D6563B36a02C5012c11d6e15552f50066d58"], // WETH
  [ADDRESSES.avax.WBTC_e,"0x1eA60d781376C06693dFB21d7e5951cAEc13F7E4"], // WBTC
]

const translateToken = {
  "0x957ca4a4aa7cdc866cf430bb140753f04e273bc0": "avax:" + ADDRESSES.avax.WAVAX,
  "0x0f7f48d4b66bf5a53d4f21fa6ffca45f70cef770": "avax:" + ADDRESSES.avax.WBTC_e,
  "0xb634a71a54d3382ff6896eb22244b4a4e54c0a82": "avax:" + ADDRESSES.avax.WETH_e,
  "0x3a91a592a06390ca7884c4d9dd4cba2b4b7f36d1": "avax:" + ADDRESSES.avax.JOE,
  "0x8b414448de8b609e96bd63dcf2a8adbd5ddf7fdd": "avax:0x8729438eb15e2c8b576fcc6aecda6a148776c0f5",
  "0x4084f32a91f4d8636ca08386efe70c6e302f1d84": "avax:0x5947bb275c521040051d82396192181b413227a3",
  "0x9669fe1ea0d8883661289461b90a10b71ae400ee": "avax:" + ADDRESSES.avax.DAI,
  "0x330cc45c8f60fef7f9d271a7512542b3d201a48d": "avax:" + ADDRESSES.avax.WBTC_e,
  "0x07b0e11d80ccf75cb390c9be6c27f329c119095a": "avax:" + ADDRESSES.avax.USDt,
  "0x0eac97a78a93b75549d49145df41dbe9cd520874": "avax:" + ADDRESSES.avax.USDC_e,
  "0x7d2d076000611e44740d636843384412399e31b9": "avax:" + ADDRESSES.avax.WETH_e,
  "0xbf5bffbf7d94d3b29abe6eb20089b8a9e3d229f7": "avax:0x8729438eb15e2c8b576fcc6aecda6a148776c0f5"
}

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  await sumTokens(balances, banksAndCollateral, chainBlocks.avax, "avax", addr=> {
    addr = addr.toLowerCase();
    if (translateToken[addr] !== undefined) {
      return translateToken[addr];
    }
    return `avax:${addr}`;
  });
  return balances;
}

async function borrowed(timestamp, block, chainBlocks) {
  let balances = {};
  const debt = (await sdk.api.abi.multiCall({
    calls: banksAndCollateral.map(p => ({
      target: p[1]
    })),
    abi: abi.totalDebt,
    block: chainBlocks.avax,
    chain: "avax"
  })).output;
  debt.forEach(p => {
    sdk.util.sumSingleBalance(balances, `avax:0xd586e7f844cea2f87f50152665bcbc2c279d8d70`, p.output)
  });
  return balances;
}

const treasuryContract = "0x10131d4f3193a59A46d3ab57D765f2604e77B4E3";
const usdc = ADDRESSES.avax.USDC_e
const ocraAvaiPGL = "0x1A9Bd67c82C0e8E47C3ad2FA772FCb9B7A831A37";
const orcaWavaxPGL = "0x73e6CB72a79dEa7ed75EF5eD6f8cFf86C9128eF5";
const avaiUsdc = "0xeD7a2B4054757Cfdb632Af15Ad528624F0fFf3B0";
async function treasury (timestamp, block, chainBlocks) {
  let balances = {};
  await sumTokensAndLPsSharedOwners(balances, [
    [usdc, false],
    [orca, false],
    [ocraAvaiPGL, true],
    [orcaWavaxPGL, true],
    [avaiUsdc, true]
  ], [treasuryContract], chainBlocks.avax, "avax", addr=>`avax:${addr}`);
  return balances;
}

module.exports = {
  avax:{
    methodology: "Tokens locked in as collateral is counted as TVL",
    tvl,
    borrowed,
    pool2: pool2Exports(podLeader, pool2LPs, "avax", addr=>`avax:${addr}`),
    treasury,
    staking: staking(podLeader, orca)
  }
}