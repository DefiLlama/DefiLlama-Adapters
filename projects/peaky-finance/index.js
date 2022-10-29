const sdk = require("@defillama/sdk");
const { gmxExports } = require("../helper/gmx");
const BigNumber = require("bignumber.js");
const { getDecimals } = require("../helper/utils");

const chainLinkOracles = {
  pBTC: "0x178ba789e24a1d51e9ea3cb1db3b52917963d71d",
  pETH: "0xfc3069296a691250ffdf21fe51340fdd415a76ed",
  pBNB: "0x137924d7c36816e0dcaf016eb617cc2c92c05782",
  pEUR: "0xd2528b74ca91bb07b9bd9685ce533367c6fa657c",
  pJPY: "0x6f3f35cc510232e41179f9010cf12b1b48538a91",
  pGBP: "0xe0a34b8fc5e80c877fd568bd22b49e1bca977b6f",
  pSGD: "0x621319ec1f6afcb4a9dd91dab135a1c7e22f46a5",
  pAUD: "0x5c8c6c45dcf57aeae4d7ba4f613b6fc38ef7d18b",
};

const tokenAddresses = {
  pBTC: "0xd2d99e9e2a26475d1b100f7a1fbd9da9fe1667ba",
  pETH: "0xac7bdca1418f4e1a5716e2634f3894a5178072ef",
  pBNB: "0x42a39376a058c743c4a9f2869fc4fcd3faea38f4",
  pEUR: "0xdf957fe55417e94306711aef4dd1d2a51da4472c",
  pJPY: "0x3f729351aa9e8f3925ae78026d527d8db65ec217",
  pGBP: "0x8fbe6a9ddfacecb32a41746a9f7873497a749736",
  pSGD: "0x05cf1377ec17dbeb6f61d62dd0af5ddf67bad00b",
  pAUD: "0x5043dbdd3342f3cbefe594ac7fb30bad22a1dcfa",
};

const interestBearingTokenAddresses = {
  pBTC: "0xAbbEe5df4F27d56128B6ac63e03DA6DE52bDF487",
  pETH: "0x1dBD4e6BD47a1eEe1FDC2CDc03c0522d551a3881",
  pBNB: "0xe426314763dd1356a0C7dCd24A8A4E2264E30faA",
  pEUR: "0xa260bbf7136a92b94D332B2DbFD2D2F9b4E197De",
  pJPY: "0x61fe42EA12c518e0bA3b45A1e8Bacd31E60C1477",
  pGBP: "0xA8c1e2ECDa8F3751C3887FBE40F008ba58881843",
  pSGD: "0x8e6D908075D0275d1213492Ac3C00E36D74740eE",
  pAUD: "0xa87Dd3DeB98E6228Ace5fc206a4F058EeDF50e7D",
};

const chain = "bsc";
const deployerWallet = "0x5B16225BDbFdf7ad9f7370D80bC5B8A846B140C4";
const multiSigWallet = "0x929A2b34F3A659142311E692b14fa6d48dd67f75";

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: async (_, _b, cb) => {
      const block = cb[chain];

      const cryptoBalances = await gmxExports({
        chain,
        vault: "0xFD8c82a5Eb07147Ff49704b67c931EC7aFd9CCEA",
      })(_, _b, cb);

      const forexBalances = await gmxExports({
        chain,
        vault: "0xb160c4070Ba9183dA27a66D53209Eb2191Df5Bd7",
      })(_, _b, cb);

      // Merging of two vault balances
      for (const key in forexBalances) {
        if (cryptoBalances.hasOwnProperty(key)) {
          cryptoBalances[key] = new BigNumber(cryptoBalances[key])
            .plus(new BigNumber(forexBalances[key]))
            .toFixed();
        } else {
          cryptoBalances[key] = forexBalances[key];
        }
      }

      const fxConfig = [];
      const tokens = [];

      Object.entries(tokenAddresses).forEach(([key, token]) => {
        tokens.push(token);
        if (!chainLinkOracles[key]) throw new Error("Missing oracle");
        const label = `${chain}:${token.toLowerCase()}`;
        fxConfig.push({
          token,
          label,
          oracle: chainLinkOracles[key],
          ibToken: interestBearingTokenAddresses[key],
        });
      });

      const { output: totalSupply } = await sdk.api.abi.multiCall({
        calls: fxConfig.map((p) => ({
          target: p.token,
        })),
        abi: abis.totalSupply,
        block,
        chain,
      });

      const { output: deployerBalances } = await sdk.api.abi.multiCall({
        calls: fxConfig.map((p) => ({
          target: p.token,
          params: deployerWallet,
        })),
        abi: abis.balanceOf,
        block,
        chain,
      });

      const { output: deployerStakedBalancesAndExchangeRates } =
        await sdk.api.abi.multiCall({
          calls: fxConfig.map((p) => ({
            target: p.ibToken,
            params: deployerWallet,
          })),
          abi: abis.getAccountSnapshot,
          block,
          chain,
        });

      const deployerStakedBalances = deployerStakedBalancesAndExchangeRates.map(
        (item) =>
          new BigNumber(item.output[1])
            .times(new BigNumber(item.output[3]))
            .div(1e18)
      );

      const deployerBorrowedBalances =
        deployerStakedBalancesAndExchangeRates.map(
          (item) => new BigNumber(item.output[2])
        );

      const { output: multiSigStakedBalancesAndExchangeRates } =
        await sdk.api.abi.multiCall({
          calls: fxConfig.map((p) => ({
            target: p.ibToken,
            params: multiSigWallet,
          })),
          abi: abis.getAccountSnapshot,
          block,
          chain,
        });

      const multiSigStakedBalances = multiSigStakedBalancesAndExchangeRates.map(
        (item) =>
          new BigNumber(item.output[1])
            .times(new BigNumber(item.output[3]))
            .div(1e18)
      );

      const multiSigBorrowedBalances =
        multiSigStakedBalancesAndExchangeRates.map(
          (item) => new BigNumber(item.output[2])
        );

      const { output: multiSigBalances } = await sdk.api.abi.multiCall({
        calls: fxConfig.map((p) => ({
          target: p.token,
          params: multiSigWallet,
        })),
        abi: abis.balanceOf,
        block,
        chain,
      });

      fxConfig.forEach(({ label }, i) => {
        // We are only deriving Synthetic Token's TVL from their Circulating Supply
        // Synthetic Tokens Circulating Supply = totalSupply - amountInVault - amountInDevWallet - ibTokenInDevWallet + ibTokenBorrowedByDevWallet - amountInMultisig - ibTokenInMultisig + ibTokenBorrowedByMultisig
        const tokenSupply = totalSupply[i].output;
        const deployerBalance = deployerBalances[i].output;
        const deployerIbBalance = deployerStakedBalances[i];
        const deployerIbBorrowedBalance = deployerBorrowedBalances[i];

        const multiSigBalance = multiSigBalances[i].output;
        const multiSigIbBalance = multiSigStakedBalances[i];
        const multiSigIbBorrowedBalance = multiSigBorrowedBalances[i];

        if (cryptoBalances.hasOwnProperty(label)) {
          cryptoBalances[label] = new BigNumber(tokenSupply)
            .minus(new BigNumber(cryptoBalances[label]))
            .minus(new BigNumber(deployerBalance))
            .minus(deployerIbBalance)
            .plus(deployerIbBorrowedBalance)
            .minus(new BigNumber(multiSigBalance))
            .minus(multiSigIbBalance)
            .plus(multiSigIbBorrowedBalance)
            .toFixed();
        }
      });

      // Retrieving Oracle prices and decimals in substitution of the synthetic tokens
      const calls = fxConfig.map((i) => ({ target: i.oracle }));
      const { output: price } = await sdk.api.abi.multiCall({
        abi: abis.latestAnswer,
        calls,
        chain,
        block,
      });

      const { output: decimals } = await sdk.api.abi.multiCall({
        abi: "erc20:decimals",
        calls,
        chain,
        block,
      });

      const tokenDecimals = await getDecimals(chain, tokens);

      fxConfig.forEach(({ label, token }, i) => {
        const bal = cryptoBalances[label];

        if (!bal) return;
        delete cryptoBalances[label];
        sdk.util.sumSingleBalance(
          cryptoBalances,
          "tether",
          (price[i].output * bal) /
            10 ** (+decimals[i].output + +tokenDecimals[token])
        );
      });

      return cryptoBalances;
    },
  },
};

const abis = {
  latestAnswer: {
    inputs: [],
    name: "latestAnswer",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  totalSupply: {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  balanceOf: {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  getAccountSnapshot: {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "getAccountSnapshot",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
};
