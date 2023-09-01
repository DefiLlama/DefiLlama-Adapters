const axios = require("axios");
const zlib = require("zlib");
const { getLogs, getAddress } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

const brotliDecode = (stream) => {
  return new Promise((resolve, reject) => {
    let responseBuffer = [];

    stream.on("data", function handleStreamData(chunk) {
      responseBuffer.push(chunk);
    });

    stream.on("error", function handleStreamError(err) {
      reject(err);
    });

    stream.on("end", function handleStreamEnd() {
      let responseData = Buffer.concat(responseBuffer);

      responseData = responseData.toString("utf8");

      resolve(JSON.parse(responseData));
    });
  });
};

const getContracts = async (chainId) => {
  const response = await axios.get(
    `https://api.myso.finance/chainIds/${chainId}/contracts`,
    {
      decompress: false,
      responseType: "stream",
      transformResponse: (data) => {
        return data.pipe(zlib.createBrotliDecompress());
      },
    }
  );

  const data = await brotliDecode(response.data);

  return data.contracts;
};

async function tvl(_, _b, _cb, { api }) {
  const newVaultCreatedTopic =
    "0xa2e0e739c28baba2e1a55e9e41fdba4a191517ff0e3fc6f04cb0ed24d3e73d96";

  const { fromBlock } = config[api.chain];

  const contracts = await getContracts(api.chainId);

  const vaultFactory = contracts?.find(
    (contract) => contract.type === "vault_factory"
  )?.contractAddr;

  const logs = await getLogs({
    api,
    target: vaultFactory,
    topics: [newVaultCreatedTopic],
    onlyArgs: true,
    fromBlock,
  });

  let ownerTokens = logs.map((i) => {
    return [
      contracts
        .filter((contract) => contract.type === "token")
        .map((contract) => contract.contractAddr),
      getAddress(i.topics[1]),
    ];
  });

  return sumTokens2({
    api,
    ownerTokens,
  });
}

const config = {
  mantle: {
    fromBlock: 3471026,
  },
};

module.exports = {};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
