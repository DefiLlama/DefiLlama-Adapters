// const sdk = require('@defillama/sdk')

const { post } = require('../http')
const { getEnv } = require('../env')

const endpoint = () => getEnv('FLOW_NON_EVM_RPC') ?? 'https://rest-mainnet.onflow.org'

async function callCadenceScript(script, isNumber = false) {
  const queryCodeBase64 = Buffer.from(script, "utf-8").toString("base64");
  const response = await post(
    `${endpoint()}/v1/scripts`,
    { script: queryCodeBase64 },
    {
      headers: { "content-type": "application/json" },
    }
  );
  let resEncoded = response;
  let resString = Buffer.from(resEncoded, "base64").toString("utf-8");
  let resJson = JSON.parse(resString);

  if (isNumber) {
    return Number(resJson.value);
  } else {
    return resJson;
  }
}

module.exports = {
  endpoint: endpoint(),
  callCadence: callCadenceScript,
};
