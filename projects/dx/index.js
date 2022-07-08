const sdk = require("@defillama/sdk");
const {
  bscContractData,
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
} = require("./config");
const {
  getLockCountPerContractV3,
  getLockerPerWalletV3,
  getLockerWalletWithIdV3,
  getLockerLPDataV3,
  getLockerTokenDataV3,
  getPresaleCountPerContractV3,
  getPresaleOwnerAddressById,
  getPresaleDataV3,
  getLPAddressFromPresaleRouterV3,
  getPresaleOwnerAddressByIdV3,
} = require("./abis");
const { getChainTransform } = require("../helper/portedTokens");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { returnBalance } = require("../helper/utils");

function getLPLockersV3(args) {
  return async (timestamp, ethBlock, chainBlocks) => {
    let balances = {};
    let lpPairs = [];
    let tokens = [];
    const chain = args.chain;
    const block = chainBlocks[chain];
    const transform = await getChainTransform(chain);

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
            console.log(walletLockCount, "count per person");
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
                lpPairs.push({
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

    await unwrapUniswapLPs(balances, lpPairs, block, chain, transform);

    for (let i = 0; i < tokens.length; i++) {
      sdk.util.sumSingleBalance(
        balances,
        transform(tokens[i].token),
        tokens[i].balance
      );
    }

    return balances;
  };
}

function getPresaleLocksV3(args) {
  return async (timestamp, ethBlock, chainBlocks) => {
    let balances = {};
    let lpPairs = [];
    const chain = args.chain;
    const block = chainBlocks[chain];
    const transform = await getChainTransform(chain);

    try {
      for (let i = 0; i < args.presales.length; i++) {
        //Get Amount of Presales on Contract
        const { output: totalPresales } = await sdk.api.abi.call({
          target: args.presales[i],
          abi: getPresaleCountPerContractV3,
          chain,
          block,
        });

        console.log(totalPresales);

        for (let j = 0; j < totalPresales; j++) {
          //Get Wallet at Presale ID
          const { output: walletToId } = await sdk.api.abi.call({
            target: args.presales[i],
            params: j,
            abi: getPresaleOwnerAddressByIdV3,
            chain,
            block,
          });

          try {
            //Get Data for the Presale
            const { output: presaleData } = await sdk.api.abi.call({
              target: args.presales[i],
              params: walletToId,
              abi: getPresaleDataV3,
              chain,
              block,
            });

            //Get LP Address from Router
            const { output: lpAddress } = await sdk.api.abi.call({
              target: presaleData["10"],
              abi: getLPAddressFromPresaleRouterV3,
              chain,
              block,
            });

            await returnBalance(
              lpAddress,
              presaleData["10"],
              block,
              chain
            ).then((value) => {
              console.log('Address: ' + lpAddress + 'Value: ' + value);
              lpPairs.push({
                token: lpAddress,
                balance: value,
              });
            });
          } catch (e) {
            console.log("Presale is not finalized");
          }
        }

      }
    } catch (e) {
      console.log(e);
    }

    console.log("End of List", lpPairs);
    await unwrapUniswapLPs(balances, lpPairs, block, chain, transform);

    return balances;
  };
}

module.exports = {

  bsc: {
    tvl: getPresaleLocksV3(bscArchives),
  },
  ethereum: {
    tvl: getPresaleLocksV3(ethereumArchives),
  },
  arbitrum: {
    tvl: getPresaleLocksV3(arbitrumArchives),
  },
  celo: {
    tvl: getPresaleLocksV3(celoArchives),
  },
  kcc: {
    tvl: getPresaleLocksV3(kucoinArchives),
  },
  harmony: {
    tvl: getPresaleLocksV3(harmonyArchives),
  },
  avalanche: {
    tvl: getPresaleLocksV3(avalancheArchives),
  },
  xdai: {
    tvl: getPresaleLocksV3(xdaiArchives),
  },
  fantom: {
    tvl: getPresaleLocksV3(fantomArchives),
  },
}
