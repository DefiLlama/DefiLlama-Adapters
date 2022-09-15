const sdk = require("@defillama/sdk");
const { getChainTransform } = require("../helper/portedTokens");
const abi = require("./abi.json");
const Web3 = require("../config/web3.js");

const contracts = {
  optimism: {
    KROM: "0xf98dcd95217e15e05d8638da4c91125e59590b07",
    position: "0x7314Af7D05e054E96c44D7923E68d66475FfaAb8",
  },
  ethereum: {
    KROM: "0x3af33bef05c2dcb3c7288b77fe1c8d2aeba4d789",
    position: "0xd1fdf0144be118c30a53e1d08cc1e61d600e508e",
  },
  arbitrum: {
    KROM: "0x55ff62567f09906a85183b866df84bf599a4bf70",
    position: "0x02c282f60fb2f3299458c2b85eb7e303b25fc6f0",
  },
};

const multicall_address = {
  ethereum: "0x1F98415757620B543A52E61c46B32eB19261F984",
  arbitrum: "0xadF885960B47eA2CD9B55E6DAc6B42b7Cb2806dB",
};

const tvl = (chain) =>
  async function (timestamp, ethBlock, chainBlocks) {
    const krom_position = contracts[chain].position;

    let transform = await getChainTransform(chain);

    const block = chainBlocks[chain];
    const balances = {};

    let orders = {};
    if (chain === "optimism") {
      // Get LP positions tokens owed
      const { output: positionsSupply } = await sdk.api.erc20.totalSupply({
        target: krom_position,
        chain,
        block,
      });

      const position_indices = Array.from(
        Array(parseInt(positionsSupply)).keys()
      );

      const calls = position_indices.map((idx) => ({
        target: krom_position,
        params: [idx],
      }));
      const tokenIds = await sdk.api.abi.multiCall({
        calls,
        abi: abi["tokenByIndex"],
        chain,
        block,
      });

      const tokenCalls = tokenIds.output.map((idx) => ({
        target: krom_position,
        params: [idx.output],
      }));

      orders = await sdk.api.abi.multiCall({
        calls: tokenCalls,
        abi: abi["orders"],
        chain,
        block,
      });
    } else {
      const calls = [];
      for (let i = 1; i <= 1550; i++) {
        const callData = Web3.eth.abi.encodeFunctionCall(
          {
            inputs: [
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
              },
            ],
            name: "orders",
            outputs: [
              {
                internalType: "address",
                name: "owner",
                type: "address",
              },
              {
                internalType: "address",
                name: "token0",
                type: "address",
              },
              {
                internalType: "address",
                name: "token1",
                type: "address",
              },
              {
                internalType: "uint24",
                name: "fee",
                type: "uint24",
              },
              {
                internalType: "int24",
                name: "tickLower",
                type: "int24",
              },
              {
                internalType: "int24",
                name: "tickUpper",
                type: "int24",
              },
              {
                internalType: "uint128",
                name: "liquidity",
                type: "uint128",
              },
              {
                internalType: "bool",
                name: "processed",
                type: "bool",
              },
              {
                internalType: "uint256",
                name: "tokensOwed0",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "tokensOwed1",
                type: "uint256",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
          [i]
        );

        const gasLimit = 60000000;
        const target = krom_position;
        calls.push([target, gasLimit, callData]);
      }

      const encodedData = Web3.eth.abi.encodeFunctionCall(
        {
          inputs: [
            {
              components: [
                {
                  internalType: "address",
                  name: "target",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "gasLimit",
                  type: "uint256",
                },
                {
                  internalType: "bytes",
                  name: "callData",
                  type: "bytes",
                },
              ],
              internalType: "struct UniswapInterfaceMulticall.Call[]",
              name: "calls",
              type: "tuple[]",
            },
          ],
          name: "multicall",
          outputs: [
            {
              internalType: "uint256",
              name: "blockNumber",
              type: "uint256",
            },
            {
              components: [
                {
                  internalType: "bool",
                  name: "success",
                  type: "bool",
                },
                {
                  internalType: "uint256",
                  name: "gasUsed",
                  type: "uint256",
                },
                {
                  internalType: "bytes",
                  name: "returnData",
                  type: "bytes",
                },
              ],
              internalType: "struct UniswapInterfaceMulticall.Result[]",
              name: "returnData",
              type: "tuple[]",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        [calls]
      );

      const estimateGas = await Web3.eth.estimateGas({
        to: multicall_address[chain],
        data: encodedData,
      });

      const result = await Web3.eth.call({
        to: multicall_address[chain],
        data: encodedData,
        gas: estimateGas,
        gasLimit: 600000000,
      });

      const decodedResult = Web3.eth.abi.decodeParameters(
        [
          {
            internalType: "uint256",
            name: "blockNumber",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "success",
                type: "bool",
              },
              {
                internalType: "uint256",
                name: "gasUsed",
                type: "uint256",
              },
              {
                internalType: "bytes",
                name: "returnData",
                type: "bytes",
              },
            ],
            internalType: "struct UniswapInterfaceMulticall.Result[]",
            name: "returnData",
            type: "tuple[]",
          },
        ],
        result
      );
      const array = decodedResult[1];
      const filteredObj = array
        .filter((element) => element.success !== false)
        .map((order) =>
          Web3.eth.abi.decodeParameters(
            [
              {
                type: "address",
                name: "owner",
              },
              {
                type: "address",
                name: "token0",
              },
              {
                type: "address",
                name: "token1",
              },
              {
                type: "uint24",
                name: "fee",
              },
              {
                type: "int24",
                name: "tickLower",
              },
              {
                type: "int24",
                name: "tickUpper",
              },

              {
                type: "uint128",
                name: "liquidity",
              },

              {
                type: "bool",
                name: "processed",
              },
              {
                type: "uint256",
                name: "tokensOwed0",
              },

              {
                type: "uint256",
                name: "tokensOwed1",
              },
            ],
            order[2]
          )
        );
      orders.output = [];
      orders.output.output = filteredObj;
    }

    // Retrieve valid orders and add tokens owed to balances
    const valid_orders = orders.output.map((order) => order.output);
    valid_orders.forEach((order) => {
      sdk.util.sumSingleBalance(
        balances,
        transform(order.token0),
        order.tokensOwed0
      );
      sdk.util.sumSingleBalance(
        balances,
        transform(order.token1),
        order.tokensOwed1
      );
    });
    return balances;
  };

const staking = (chain) =>
  async function (timestamp, ethBlock, chainBlocks) {
    const krom = contracts[chain].KROM;
    const krom_position = contracts[chain].position;

    let transform = await getChainTransform(chain);
    const block = chainBlocks[chain];

    // Get Kroma deposited by users to pay for their fees
    const { output: balance } = await sdk.api.erc20.balanceOf({
      target: krom,
      owner: krom_position,
      chain,
      block,
    });
    const balances = {};
    sdk.util.sumSingleBalance(balances, transform(krom), balance);

    return balances;
  };

module.exports = {
  methodology:
    "Kromatika handles Uniswap-v3 positions for their users who submit limit orders - TVL is amounts of tokens of each LP as well as KROM held by the contract to pay for fees",
  optimism: {
    tvl: tvl("optimism"),
    staking: staking("optimism"),
  },
  arbitrum: {
    tvl: () => ({}),
    staking: staking("arbitrum"),
  },
  ethereum: {
    tvl: tvl("ethereum"),
    staking: staking("ethereum"),
  },
};
// UniswapV3Pool NonfungiblePositionManager has a low level mint method
// this is what UniswapNFT uses and Kromatikaa is also using it; so in a way Kromatika is a different NFT LP manager for UniswapV3 but for limit orders
// users gets Kromatika NFT for their limit position;  same as they get Uniswap NFT for their LP; so it is a similar impl from Uniswap, but extended to support limit orders
