const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = {
    "locked": "function locked(uint256 tokenId) external view returns (int128, uint256)",
    "currentTokenId": "uint256:currentTokenId",
    "tokenIdToMarionetteId": "function tokenIdToMarionetteId(uint256) external view returns (bytes32)",
    "getMarionette": {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getMarionette",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "veId",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "enum Marionette.RewardMode",
                  "name": "rewardMode",
                  "type": "uint8"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ],
              "internalType": "struct Marionette.RewardConfig",
              "name": "customRewardConfig",
              "type": "tuple"
            },
            {
              "components": [
                {
                  "internalType": "enum Marionette.LockMode",
                  "name": "lockMode",
                  "type": "uint8"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ],
              "internalType": "struct Marionette.LockConfig",
              "name": "customLockConfig",
              "type": "tuple"
            }
          ],
          "internalType": "struct Marionette.MarionetteState",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  };

const CONFIG = {
  USD: {
    veToken: "0x0966CAE7338518961c2d35493D3EB481A75bb86B",
    token: ADDRESSES.sonic.scUSD,
    pupeeter: "0x82136B5B2FA53AEFaB8d7C87467D8e7036Bb3f72",
  },
  ETH: {
    veToken: "0x1Ec2b9a77A7226ACD457954820197F89B3E3a578",
    token: ADDRESSES.sonic.scETH,
    pupeeter: "0x113166Ad6E99c5346aDF41d5821A6856e1510812",
  },
}

const getMarionettesLocks = async (api, tokenType) => {
  const nbMarionettes = await api.call({
    target: CONFIG[tokenType].pupeeter,
    abi: abi.currentTokenId,
  });

  const calls = [];
  for (let i = 1; i <= nbMarionettes; ++i) {
    calls.push({
      target: CONFIG[tokenType].pupeeter,
      params: [BigInt(i)],
    });
  }

  const results = await api.multiCall({
    abi: abi.getMarionette,
    calls,
    permitFailure: true,
  });

  return results
    .filter((state) => state !== null && state.veId !== null)
    .map((state) => state.veId);
}

const marionetteTvl = async (api, tokenType) => {
  const balances = {};

  const marionetteLocks = await getMarionettesLocks(api, tokenType);
  const marionetteBalances = await api.multiCall({
    abi: abi.locked,
    calls: marionetteLocks.map((lock) => ({
      target: CONFIG[tokenType].veToken,
      params: [lock],
    })),
  });
  const sum = marionetteBalances.reduce((acc, balance) => {
    return acc + BigInt(balance[0]);
  }, 0n);

  sdk.util.sumSingleBalance(
    balances,
    CONFIG[tokenType].token,
    sum,
    api.chain
  );
  return balances;
}

async function tvl(api,) {
  const [ethTvl, usdTvl] = await Promise.all([
    marionetteTvl(api, "ETH"),
    marionetteTvl(api, "USD"),
  ]);

  sdk.util.mergeBalances(ethTvl, usdTvl);

  return ethTvl;
}

module.exports = {
  methodology: "Counts the total veUSD and veETH locked owned by marionettes",
  sonic: {
    tvl,
  },
};
