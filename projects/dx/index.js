const sdk = require("@defillama/sdk");
const {
  polygonArchives,
  bscArchives,
  ethereumArchives,
  fantomArchives,
  xdaiArchives,
  avalancheArchives,
  harmonyArchives,
  arbitrumArchives,
  celoArchives,
  kucoinArchives,
  okexchainArchives,
  hecoArchives,
  cronosArchives,
  moonriverArchives,
  smartbchArchives,
  milkomedaArchives,
} = require("./config");
const {
  getLockCountPerContractV3,
  getLockerPerWalletV3,
  getLockerWalletWithIdV3,
  getLockerLPDataV3,
  getLockerTokenDataV3,
  getStorageLockDataV33,
  getStorageLockCountV33,
} = require("./abis");
const { getChainTransform } = require("../helper/portedTokens");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

function getTVLTotal(args) {
  return async (timestamp, ethBlock, chainBlocks) => {
    let balances = {};
    let tokens = [];
    let lptokens = [];
    const chain = args.chain;
    const block = chainBlocks[chain];

    try{
      const transform = await getChainTransform(chain);

      //Get Liquidity Locks new from storage
      try {
        for (let i = 0; i < args.storageLiquidityLocks.length; i++) {
          //Get Amount of Locks on Contract
          const { output: totalLocks } = await sdk.api.abi.call({
            target: args.storageLiquidityLocks[i],
            abi: getStorageLockCountV33,
            chain,
            block,
          });

          for (let j = 0; j < totalLocks; j++) {
            //Get Wallet at Lock ID
            const { output: lockData } = await sdk.api.abi.call({
              target: args.storageLiquidityLocks[i],
              params: j,
              abi: getStorageLPLockDataV33,
              chain,
              block,
            });
            const getTokenBalance = (
              await sdk.api.abi.call({
                abi: "erc20:balanceOf",
                target: lockData[2],
                params: lockData[4],
                chain,
                block,
              })
            ).output;

            lptokens.push({
              token: lockData[2],
              balance: getTokenBalance,
            });
          }
        }
      } catch (e) {
        console.log(e);
      }
      //Get Token Locks new from storage
      try {
        for (let i = 0; i < args.storageTokenLocks.length; i++) {
          //Get Amount of Locks on Contract
          const { output: totalLocks } = await sdk.api.abi.call({
            target: args.storageTokenLocks[i],
            abi: getStorageLockCountV33,
            chain,
            block,
          });

          for (let j = 0; j < totalLocks; j++) {
            //Get Wallet at Lock ID
            const { output: lockData } = await sdk.api.abi.call({
              target: args.storageTokenLocks[i],
              params: j,
              abi: getStorageTokenLockDataV33,
              chain,
              block,
            });
            const getTokenBalance = (
              await sdk.api.abi.call({
                abi: "erc20:balanceOf",
                target: lockData[2],
                params: lockData[4],
                chain,
                block,
              })
            ).output;

            tokens.push({
              token: lockData[2],
              balance: getTokenBalance,
            });
          }
        }
      } catch (e) {
        console.log(e);
      }
      //Get Locks from Archives
      try {
        for (let i = 0; i < args.locks.length; i++) {
          let preventDuplicates = [];
          //Get Amount of Locks on Contract
          const { output: totalLocks } = await sdk.api.abi.call({
            target: args.locks[i],
            abi: getLockCountPerContractV3,
            chain,
            block,
          });

          for (let j = 0; j < totalLocks; j++) {
            //Get Wallet at Lock ID
            const { output: walletToId } = await sdk.api.abi.call({
              target: args.locks[i],
              params: j,
              abi: getLockerWalletWithIdV3,
              chain,
              block,
            });
            //Get Count of Locks per wallet
            const { output: walletLockCount } = await sdk.api.abi.call({
              target: args.locks[i],
              params: walletToId,
              abi: getLockerPerWalletV3,
              chain,
              block,
            });

            if (preventDuplicates.includes(walletToId)) {
              continue;
            }
            preventDuplicates.push(walletToId);

            for (let k = 0; k < walletLockCount; k++) {
              try {
                //Try resolving as LP Lock
                const { output: returnFromDataStruct } = await sdk.api.abi.call({
                  target: args.locks[i],
                  params: [walletToId, k],
                  abi: getLockerLPDataV3,
                  chain,
                  block,
                });

                if (returnFromDataStruct[1]) {
                  lptokens.push({
                    token: returnFromDataStruct[6],
                    balance: returnFromDataStruct[3],
                  });
                }
              } catch (e) {
                console.log("No LP Lock", e);
                //If not a LP Lock it's a token Lock
                const { output: returnFromDataStruct } = await sdk.api.abi.call({
                  target: args.locks[i],
                  params: [walletToId, k],
                  abi: getLockerTokenDataV3,
                  chain,
                  block,
                });

                if (returnFromDataStruct[1]) {
                  tokens.push({
                    token: returnFromDataStruct[12],
                    balance: returnFromDataStruct[3],
                  });
                }
              }
            }
          }
        }
      } catch (e) {
        console.log(e);
      }

      try {
        await unwrapUniswapLPs(balances, lptokens, block, chain, transform);

        for (let i = 0; i < tokens.length; i++) {
          sdk.util.sumSingleBalance(
            balances,
            transform(tokens[i].token),
            tokens[i].balance
          );
        }
      } catch (e) {
        console.log(e);
      }
    }catch (e) {
      console.log(e);
    }

    return balances;
  };
}

module.exports = {
  polygon: {
    tvl: getTVLTotal(polygonArchives),
  },
  bsc: {
    tvl: getTVLTotal(bscArchives),
  },
  ethereum: {
    tvl: getTVLTotal(ethereumArchives),
  },
  arbitrum: {
    tvl: getTVLTotal(arbitrumArchives),
  },
  celo: {
    tvl: getTVLTotal(celoArchives),
  },
  kcc: {
    tvl: getTVLTotal(kucoinArchives),
  },
  harmony: {
    tvl: getTVLTotal(harmonyArchives),
  },
  avalanche: {
    tvl: getTVLTotal(avalancheArchives),
  },
  xdai: {
    tvl: getTVLTotal(xdaiArchives),
  },
  fantom: {
    tvl: getTVLTotal(fantomArchives),
  },
  heco: {
    tvl: getTVLTotal(hecoArchives),
  },
  okexchain: {
    tvl: getTVLTotal(okexchainArchives),
  },
  cronos: {
    tvl: getTVLTotal(cronosArchives),
  },
  moonriver: {
    tvl: getTVLTotal(moonriverArchives),
  },
  milkomeda: {
    tvl: getTVLTotal(milkomedaArchives),
  },
};
