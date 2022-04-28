const sdk = require("@defillama/sdk");

const ATID_ABI = require("./abi/WASTR.json");
const BAI_ABI = require("./abi/WASTR.json");
const WASTR_ABI = require("./abi/WASTR.json");

const NATIVE_TOKEN_WASTAR = "0x19574c3c8FaFc875051b665Ec131b7E60773d2C9";
const START_BLOCK = 912772;

const TOKENS_ADDRESSES = {
  BAI: "0x733ebcC6DF85f8266349DEFD0980f8Ced9B45f35",
  ATID: "0x5271D85CE4241b310C0B34b7C2f1f036686A6d7C",
  WASTR: NATIVE_TOKEN_WASTAR,
};

const chain = "astar";

const ATID_CONTRACT = (
  await sdk.api.abi.call({
    target: TOKENS_ADDRESSES.ATID,
    abi: ATID_ABI,
    block,
    chain,
  })
).output;

const BAI_CONTRACT = (
  await sdk.api.abi.call({
    target: TOKENS_ADDRESSES.BAI,
    abi: BAI_ABI,
    block,
    chain,
  })
).output;

const WASTR_CONTRACT = (
  await sdk.api.abi.call({
    target: TOKENS_ADDRESSES.WASTR,
    abi: WASTR_ABI,
    block,
    chain,
  })
).output;

module.exports = {
  timetravel: true,
  methodology: "AstridDAO TVL Calculation and Total Supply of BAI",
  astar: {
    basicTVL: "",
    Borrows: "",
  },
};
