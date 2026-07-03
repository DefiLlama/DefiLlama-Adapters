const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2: sumCardanoTokens2 } = require("../helper/chain/cardano");

const ETHEREUM_TREASURY_ADDRESSES = [
  "0xbF4cFccd11257e568A936a7867D138f54A43cffa",
];

const CARDANO_TREASURY_ADDRESSES = [
  "addr1wxzar75lms9547xdz4slxk7r362rs4g4ccurl22g764akngjhjtzp",
  "addr1w88zvhrrlqj6kl94mel769v348khd5w3jz3av33ksp8wgvss6msuw",
];

const CARDANO_PROTOCOL_ADDRESSES = [
  "addr1w9ygqdx9law3waqgm6eamf2xhxs5x83r0pfka928jmydkuc6ykls3",
  "addr1wy2gch9ua0700a3dg423wxcwx4p886m4ny5u3aqs66sluqcly9uud",
  "addr1q9mqsgrgdaq9aahjfcrc6f45sgmcut4gu3c774kqzawkjkhujht5h40l2yrm8e7r2vwr2g3tv64pzjgnxwsztwg0yu5s00jz00",
  "addr1z9nsxjyw7xgfw5jtfxcw7fxucte0277ununa4evyxcw3evg6409492020k6xml8uvwn34wrexagjh5fsk5xk96jyxk2q4366ry",
  "addr1zy48lqwffvzkahcyrhj8982p3f7c002g098ly4zxzxefnlg6409492020k6xml8uvwn34wrexagjh5fsk5xk96jyxk2qst04fy",
];

const CARDANO_USDM =
  "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d";

async function ethereumTvl(api) {
  return api.sumTokens({
    owners: ETHEREUM_TREASURY_ADDRESSES,
    tokens: [ADDRESSES.ethereum.USDC],
  });
}

async function cardanoTvl() {
  const balances = await sumCardanoTokens2({
    owners: CARDANO_PROTOCOL_ADDRESSES,
  });

  return sumCardanoTokens2({
    balances,
    owners: CARDANO_TREASURY_ADDRESSES,
    tokens: [CARDANO_USDM],
  });
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts assets held in Strike's Cardano and Ethereum protocol addresses.",
  ethereum: {
    tvl: ethereumTvl,
  },
  cardano: {
    tvl: cardanoTvl,
  },
};
