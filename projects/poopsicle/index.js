const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const abi = require("./abi.json");

const TOKEN = "Poopsicle";
const CHAIN = "fantom";
const DECIMAL = 10 ** 18;

const data = {
  poop: {
    lp: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    dt: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    tg: "0x019Def2b8fbc37775e14E0399427f09E109eED68",
  },
  ftm_poop: {
    lp: "0x2596c9ae09ff8ad6228aF1E7Ff1dA34f18Ce0e8d",
    dt: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    tg: "0x8e6e5C703e8BC615cC3667Fa5b9be79585250de7",
  },
  any_poop: {
    lp: "0x176FA7bFf7C2182c57C24B75c55B7a38e84Ce696",
    dt: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    tg: "0x3e56790C3E307CaDFaa53403649263174451f676",
  },
  usdc_poop: {
    lp: "0x52cDD904263294021F2976f9D148530bb09bf829",
    dt: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    tg: "0x6f623B24976E71e228C90c11BBB54A76D829FB34",
  },
  boo_poop: {
    lp: "0xF7c7dc9d3649023cdEd3bA7703BbaEC9e5284E7f",
    dt: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    tg: "0xC3488a8902080becDaD05c741c7C1F79a7BCbf32",
  },
  band_poop: {
    lp: "0x7217d6bC822D41F7D679588cFc21baEe7eb94D33",
    dt: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    tg: "0x1F36221843A6AbDe44d6cb039613a420E14FF7b0",
  },
  link_poop: {
    lp: "0x51F309b9220cB05F33F3c76b3eafE82996071224",
    dt: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    tg: "0x32C292fb33d19DCA2485F5dB0ab884Dd45cC5869",
  },
  gohm_poop: {
    lp: "0x861efb3eae9a878a1d52cfd8b1633ff69050e7cd",
    dt: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    tg: "0xd1C5E8E047618875e0E72b6470Cc854620a757d2",
  },
  spirit_poop: {
    lp: "0x94f2c393eca09e04f0e0c1eb0a3c5cea29b8e86f",
    dt: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    tg: "0x832f509a97f6eD580eA50b82eB9520765096Af92",
  },
};

async function poop(timestamp, ethBlock, {[CHAIN]: block}) {

  const result = await sdk.api.abi.call({
    target: data["poop"].tg,
    abi: abi["totalStaked"],
    block: block,
    chain: CHAIN,
  });

  return {
    [TOKEN]: Number(result.output) / DECIMAL,
  };
}

module.exports = {
  fantom: {
    tvl: () => ({}),
    pool2: sdk.util.sumChainTvls([
      poop,
      staking(data["ftm_poop"].lp, data["ftm_poop"].dt, CHAIN),
      staking(data["any_poop"].lp, data["any_poop"].dt, CHAIN),
      staking(data["usdc_poop"].lp, data["usdc_poop"].dt, CHAIN),
      staking(data["boo_poop"].lp, data["boo_poop"].dt, CHAIN),
      staking(data["band_poop"].lp, data["band_poop"].dt, CHAIN),
      staking(data["link_poop"].lp, data["link_poop"].dt, CHAIN),
      staking(data["gohm_poop"].lp, data["gohm_poop"].dt, CHAIN),
      staking(data["spirit_poop"].lp, data["spirit_poop"].dt, CHAIN),
    ]),
  },
};
