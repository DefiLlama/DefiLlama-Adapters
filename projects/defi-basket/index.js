const sdk = require("@defillama/sdk");
const retry = require("async-retry");
const axios = require("axios");
const { getChainTransform } = require("../helper/portedTokens");
const abi = require("./abi.json");

const defiBasketNFTTokenTracker = "0xee13C86EE4eb1EC3a05E2cc3AB70576F31666b3b";

const getWalletAddress = async (walletNo) => {
  //reason for try/catch is that Axios sometimes throws error if wallet does not exist
  try {
    const walletData = await axios.get(
      `https://www.defibasket.org/api/get-nft-metadata/${walletNo}`
    );

    const walletAttributes = walletData.data.attributes; //only exists when wallet has portfolio
    const walletInfo = walletData.data.description;

    if (walletAttributes !== undefined) {
      const pos = walletInfo.indexOf("0x");
      const address = walletInfo.slice(pos, pos + 42);
      return address;
    }
  } catch (e) {}
};

function polygonTVL() {
  return async (timestamp, ethBlock, chainBlocks) => {
    let balances = {};
    const chainTransform = await getChainTransform("polygon");

    const numberOfWallets = await sdk.api.abi.call({
      target: defiBasketNFTTokenTracker,
      abi,
      block: chainBlocks["polygon"],
      chain: "polygon",
    });

    for (let walletNo = 0; walletNo < numberOfWallets.output; walletNo++) {
      let walletAddress = await getWalletAddress(walletNo);
      if (typeof walletAddress === "string") {
        const walletPortfolio = await retry(
          async (bail) =>
            await axios.get(
              `https://www.defibasket.org/api/get-portfolio/polygon/${walletAddress}`
            )
        );

        const walletTokens = walletPortfolio.data.allocation;
        let tokens = [];
        for (token of walletTokens) {
          if (token.asset !== undefined) {
            /*
             * multiCall fails when token type is not token or IAaveV2Deposit,
             * so other token types are skipped and not counted in TVL
             */
            if (
              token.asset.type === "token" ||
              token.asset.type === "IAaveV2Deposit"
            ) {
              tokens.push(token.asset.address);
            } else if (token.asset.type === "IAaveRewards") {
              let aTokenToAdd = token.asset.callParams.aToken;
              tokens = [
                aTokenToAdd,
                ...tokens.filter((aToken) => aToken != aTokenToAdd),
              ];
            }
          }
        }

        let calls = [];
        for (token of tokens) {
          calls.push({
            target: token,
            params: [walletAddress],
          });
        }

        let tokenBalances = await sdk.api.abi.multiCall({
          abi: "erc20:balanceOf",
          calls: calls,
          block: chainBlocks["polygon"],
          chain: "polygon",
        });
        sdk.util.sumMultiBalanceOf(
          balances,
          tokenBalances,
          true,
          chainTransform
        );
      }
    }

    return balances;
  };
}

module.exports = {
  misrepresentedTokens: false,
  timetravel: true,
  methodology:
    "TVL is calculated by summing the value of all tokens in all DeFi Basket portfolio wallet contracts.",
  polygon: {
    tvl: polygonTVL(),
  },
};
