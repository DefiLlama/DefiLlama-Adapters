const axios = require("axios");
const zlib = require("zlib");
const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getCache, setCache } = require("../helper/cache");

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
  const { fromBlock } = config[api.chain];
  let contracts;

  try {
    contracts = await getContracts(api.chainId);
    await setCache("myso-v2", api.chain, contracts);
  } catch (e) {
    contracts = await getCache("myso-v2", api.chain);
  }

  const vaultFactory = contracts?.find(
    (contract) => contract.type === "vault_factory"
  )?.contractAddr;

  const logs = await getLogs({
    api,
    target: vaultFactory,
    eventAbi:
      "event NewVaultCreated(address indexed newLenderVaultAddr, address vaultOwner, uint256 numRegisteredVaults)",
    onlyArgs: true,
    fromBlock,
  });

  let ownerTokens = logs.map((i) => {
    return [
      contracts
        .filter((contract) => contract.type === "token")
        .map((contract) => contract.contractAddr),
      i.newLenderVaultAddr,
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
  ethereum: {
    fromBlock: 18213104,
  },
  arbitrum: {
    fromBlock: 143181867,
  },
  base: {
    fromBlock: 6239916,
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
