const { queryContract, sumTokens } = require("../helper/chain/cosmos");

const nfaContract = "neutron1pwjn3tsumm3j7v7clzqhjsaukv4tdjlclhdytawhet68fwlz84fqcrdyf5";

async function tvl(api) {
  const baseDenoms = await queryContract({ contract: nfaContract, chain: "neutron", data: "{\"get_base_denoms\":{}}" });
  const assets = baseDenoms.map(({ denom }) => denom);
  return await sumTokens({
    owners: [nfaContract],
    chain: "neutron", 
    tokens: assets,
    api,
  });
}

module.exports = {
  methodology: "Queries the NFA.zone contract to get the supported base assets. The sum of all these base assets held by the contract is returned.",
  neutron: {
    tvl
  }
}