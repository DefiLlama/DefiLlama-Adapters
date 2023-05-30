const { sumTokens2 } = require("../helper/unwrapLPs");
const axios = require("axios");
const zlib = require("zlib");

const mapChainToChainId = {
  ethereum: 1,
  arbitrum: 42161,
};

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

const getPools = async (chainId) => {
  const response = await axios.get(
    `https://api.myso.finance/chainIds/${chainId}/pools`,
    {
      decompress: false,
      responseType: "stream",
      transformResponse: (data) => {
        return data.pipe(zlib.createBrotliDecompress());
      },
    }
  );

  const data = await brotliDecode(response.data);

  return data.pools.map((pool) => pool.poolAddress);
};

async function tvl(_, _b, _cb, { api, chain }) {
  const chainId = mapChainToChainId[chain];
  const pools = await getPools(chainId);

  const data = await api.multiCall({
    abi: "function getPoolInfo() view returns (address _loanCcyToken, address _collCcyToken, uint256 _maxLoanPerColl, uint256 _minLoan, uint256 _loanTenor, uint256 _totalLiquidity, uint256 _totalLpShares, uint256 _baseAggrBucketSize, uint256 _loanIdx)",
    calls: pools,
  });
  const toa = pools
    .map((owner, i) => [
      [data[i]._loanCcyToken, owner],
      [data[i]._collCcyToken, owner],
    ])
    .flat();
  return sumTokens2({ api, tokensAndOwners: toa, chain });
}

module.exports = {
  ethereum: { tvl },
  arbitrum: { tvl },
  methodology: "token held as collateral + liquidity left to be borrowed",
};
