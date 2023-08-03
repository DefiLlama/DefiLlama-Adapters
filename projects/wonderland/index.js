const ADDRESSES = require('../helper/coreAssets.json')
const { stakings } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const TimeStaking = "0x4456B87Af11e87E329AB7d7C7A246ed1aC2168B9";
const RevenueSharingFarm = "0xC172c84587bEa6d593269bFE08632bf2Da2Bc0f6";
const TIME = "0xb54f16fB19478766A268F172C9480f8da1a7c9C3";
const wMEMO = "0x0da67235dd5787d67955420c84ca1cecd4e5bb3b";

const Treasury_Eth = "0x355D72Fb52AD4591B2066E43e89A7A38CF5cb341";
const Treasury_Avax = "0x88bbE6dE858B179841c8f49a56b99fb0522a263a";

async function avaxTvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const transform = (addr) =>
    addr.toLowerCase() === ADDRESSES.avax.USDt
      ? [ADDRESSES.ethereum.USDT]: `avax:${addr}`;

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [ADDRESSES.avax.USDt, false],
      [ADDRESSES.avax.USDC_e, false],
      ["0x39fC9e94Caeacb435842FADeDeCB783589F50f5f", false], // KNC
      ["0x63682bDC5f875e9bF69E201550658492C9763F89", false], // BSGG
      ["0x0da67235dd5787d67955420c84ca1cecd4e5bb3b", false], //wMEMO
    ],
    [Treasury_Avax],
    chainBlocks.avax,
    "avax",
    transform
  );

  const wmemoAddress = transform(wMEMO);
  delete balances[wmemoAddress];

  return balances;
}

async function ethTvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [ADDRESSES.ethereum.LUSD, false],
      ["0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0", false], // FRAX
      [ADDRESSES.ethereum.CVX, false],
      [ADDRESSES.ethereum.cvxCRV, false],
      ["0x55C08ca52497e2f1534B59E2917BF524D4765257", false], // UwU
      ["0x69570f3E84f51Ea70b7B68055c8d667e77735a25", false], // BSGG
      ["0x04906695D6D12CF5459975d7C3C03356E4Ccd460", false], // sOHM
      ["0x29127fE04ffa4c32AcAC0fFe17280ABD74eAC313", false], // sifu
      [ADDRESSES.ethereum.TUSD, false],
      ["0x66761Fa41377003622aEE3c7675Fc7b5c1C2FaC5", false], // CPOOL
      ["0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF", false], // ALCX
      ["0xdB25f211AB05b1c97D595516F45794528a807ad8", false], // EURS
      [ADDRESSES.ethereum.GNO, false], // GNO
      ["0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68", false], // INV
      ["0xE80C0cd204D654CEbe8dd64A4857cAb6Be8345a3", false], // JPEG
      ["0x0C10bF8FcB7Bf5412187A595ab97a3609160b5c6", false], // USDD
      ["0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6", false], // STG
      ["0x6243d8CEA23066d098a15582d81a598b4e8391F4", false], // FLX
      [ADDRESSES.ethereum.SNX, false],
      [ADDRESSES.ethereum.USDT, false],
      [ADDRESSES.ethereum.DAI, false],
    ],
    [Treasury_Eth],
    ethBlock,
    "ethereum"
  );

  return balances;
}

module.exports = {
  avax: {
    tvl: avaxTvl,
    staking: stakings([TimeStaking, RevenueSharingFarm], [TIME, wMEMO], "avax"),
  },
  ethereum: {
    tvl: ethTvl,
  },
  methodology:
    "Counts tokens on the treasury for TVL, Staked TIME for Staking and Revenue Sharing Farm.",
};
