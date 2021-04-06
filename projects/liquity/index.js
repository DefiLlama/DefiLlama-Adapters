const sdk = require("@defillama/sdk");
const getEntireSystemCollAbi = require("./getEntireSystemColl.abi.json")

const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';

// TroveManager has a record of total system collateral (deposited ETH)
const TROVE_MANAGER_ADDRESS = "0xA39739EF8b0231DbFA0DcdA07d7e29faAbCf4bb2";

async function tvl(_, block) {
  const balance = (
    await sdk.api.abi.call({
      target: TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block,
    })
  ).output;

  return { [ETH_ADDRESS]: balance };
}

module.exports = {
  name: "Liquity",
  token: "LQTY",
  category: "lending",
  start: 1617607296,
  tvl,
};
