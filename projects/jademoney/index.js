const { queryContract } = require("../helper/chain/cosmos");

const jadeContract = "neutron1mdy5fhtwdjagp5eallsdhlx6gxylm8rxqk72wjzg6y5d5kt44ysqprkduw";
const usdcDenom = "ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81";

async function tvl(api) {
  const data = await queryContract({ contract: jadeContract, chain: "neutron", data: "{\"value\":{}}" });
  api.add(usdcDenom, 0); // Mars Hacked
}

module.exports = {
  methodology: "Queries the Jade.Money contract for the total value of USDC deposits.",
  neutron: {
    tvl
  }
}