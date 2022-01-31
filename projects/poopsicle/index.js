const sdk = require("@defillama/sdk");
const { getBlock } = require("../helper/getBlock");
const { staking } = require("../helper/staking");
const abi = require("./abi.json");

const TOKEN = "POOPSICLE";
const CHAIN = "fantom";
const DECIMALS = 18;

const data = {
  poop: {
    lp: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    dt: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    tg: "0x019Def2b8fbc37775e14E0399427f09E109eED68",
  },
  ftm_poop: {
    lp: "0x2596c9ae09ff8ad6228aF1E7Ff1dA34f18Ce0e8d",
    dt: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    ftm: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
    tg: "0x8e6e5C703e8BC615cC3667Fa5b9be79585250de7",
  },
  any_poop: {
    lp: "0x176FA7bFf7C2182c57C24B75c55B7a38e84Ce696",
    dt: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    any: "0xddcb3ffd12750b45d32e084887fdf1aabab34239",
    tg: "0x3e56790C3E307CaDFaa53403649263174451f676",
  },
  usdc_poop: {
    lp: "0x52cDD904263294021F2976f9D148530bb09bf829",
    dt: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    usdc: "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
    tg: "0x6f623B24976E71e228C90c11BBB54A76D829FB34",
  },
  boo_poop: {
    lp: "0xF7c7dc9d3649023cdEd3bA7703BbaEC9e5284E7f",
    dt: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    boo: "0x841fad6eae12c286d1fd18d1d525dffa75c7effe",
    tg: "0xC3488a8902080becDaD05c741c7C1F79a7BCbf32",
  },
  band_poop: {
    lp: "0x7217d6bC822D41F7D679588cFc21baEe7eb94D33",
    dt: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    band: "0x46E7628E8b4350b2716ab470eE0bA1fa9e76c6C5",
    tg: "0x1F36221843A6AbDe44d6cb039613a420E14FF7b0",
  },
  link_poop: {
    lp: "0x51F309b9220cB05F33F3c76b3eafE82996071224",
    dt: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    link: "0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8",
    tg: "0x32C292fb33d19DCA2485F5dB0ab884Dd45cC5869",
  },
  gohm_poop: {
    lp: "0x861efb3eae9a878a1d52cfd8b1633ff69050e7cd",
    dt: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    gohm: "0x91fa20244Fb509e8289CA630E5db3E9166233FDc",
    tg: "0xd1C5E8E047618875e0E72b6470Cc854620a757d2",
  },
  spirit_poop: {
    lp: "0x94f2c393eca09e04f0e0c1eb0a3c5cea29b8e86f",
    dt: "0x070eb1a48725622de867a7e3d1dd4f0108966ed1",
    spirit: "0x5cc61a78f164885776aa610fb0fe1257df78e59b",
    tg: "0x832f509a97f6eD580eA50b82eB9520765096Af92",
  },
};

async function poop(timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, CHAIN, chainBlocks[CHAIN], true);

  const result = await sdk.api.abi.call({
    target: data["poop"].tg,
    abi: abi["totalStaked"],
    block: block,
    chain: CHAIN,
  });

  return {
    [TOKEN]: Number(result.output) / 10 ** DECIMALS,
  };
}

module.exports = {
  fantom: {
    tvl: async () => ({}),
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

      staking(data["ftm_poop"].lp, data["ftm_poop"].ftm, CHAIN),
      staking(data["any_poop"].lp, data["any_poop"].any, CHAIN),
      staking(data["usdc_poop"].lp, data["usdc_poop"].usdc, CHAIN),
      staking(data["boo_poop"].lp, data["boo_poop"].boo, CHAIN),
      staking(data["band_poop"].lp, data["band_poop"].band, CHAIN),
      staking(data["link_poop"].lp, data["link_poop"].link, CHAIN),
      staking(data["gohm_poop"].lp, data["gohm_poop"].gohm, CHAIN),
      staking(data["spirit_poop"].lp, data["spirit_poop"].spirit, CHAIN),
    ]),
    // poop,
    // ftm_poop: sdk.util.sumChainTvls([
    //   staking(data["ftm_poop"].lp, data["ftm_poop"].dt, CHAIN),
    //   staking(data["ftm_poop"].lp, data["ftm_poop"].ftm, CHAIN),
    // ]),
    // any_poop: sdk.util.sumChainTvls([
    //   staking(data["any_poop"].lp, data["any_poop"].dt, CHAIN),
    //   staking(data["any_poop"].lp, data["any_poop"].any, CHAIN),
    // ]),
    // usdc_poop: sdk.util.sumChainTvls([
    //   staking(data["usdc_poop"].lp, data["usdc_poop"].dt, CHAIN),
    //   staking(data["usdc_poop"].lp, data["usdc_poop"].usdc, CHAIN),
    // ]),
    // boo_poop: sdk.util.sumChainTvls([
    //   staking(data["boo_poop"].lp, data["boo_poop"].dt, CHAIN),
    //   staking(data["boo_poop"].lp, data["boo_poop"].boo, CHAIN),
    // ]),
    // band_poop: sdk.util.sumChainTvls([
    //   staking(data["band_poop"].lp, data["band_poop"].dt, CHAIN),
    //   staking(data["band_poop"].lp, data["band_poop"].band, CHAIN),
    // ]),
    // link_poop: sdk.util.sumChainTvls([
    //   staking(data["link_poop"].lp, data["link_poop"].dt, CHAIN),
    //   staking(data["link_poop"].lp, data["link_poop"].link, CHAIN),
    // ]),
    // gohm_poop: sdk.util.sumChainTvls([
    //   staking(data["gohm_poop"].lp, data["gohm_poop"].dt, CHAIN),
    //   staking(data["gohm_poop"].lp, data["gohm_poop"].gohm, CHAIN),
    // ]),
    // spirit_poop: sdk.util.sumChainTvls([
    //   staking(data["spirit_poop"].lp, data["spirit_poop"].dt, CHAIN),
    //   staking(data["spirit_poop"].lp, data["spirit_poop"].spirit, CHAIN),
    // ]),
  },
};
