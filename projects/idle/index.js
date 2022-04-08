const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const abi = require("./abi.json");
const { chainExports } = require("../helper/exports");

const contracts = {
  ethereum: [
    "0xC8E6CA6E96a326dC448307A5fDE90a0b21fd7f80",
    "0x5C960a3DCC01BE8a0f49c02A8ceBCAcf5D07fABe",
    "0xb2d5CB72A621493fe83C6885E4A776279be595bC",
    "0x3fe7940616e5bc47b0775a0dccf6237893353bb4",
    "0x78751b12da02728f467a44eac40f5cbc16bd7934",
    "0x5274891bEC421B39D23760c04A6755eCB444797C",
    "0x12B98C621E8754Ae70d0fDbBC73D6208bC3e3cA6",
    "0xF34842d05A1c888Ca02769A633DF37177415C2f8",
    "0x63D27B3DA94A9E871222CB0A32232674B02D2f2D",
    "0xf52cdcd458bf455aed77751743180ec4a595fd3f",
    "0xe79e177d2a5c7085027d7c64c8f271c81430fc9b",
    "0xc278041fDD8249FE4c1Aad1193876857EEa3D68c",
    "0x51C77689A9c2e8cCBEcD4eC9770a1fA5fA83EeF1",
    "0x8C81121B15197fA0eEaEE1DC75533419DcfD3151",
    "0xD6f279B7ccBCD70F8be439d25B9Df93AEb60eC55",
    "0xa14ea0e11121e6e951e87c66afe460a00bcd6a16",
    "0x1846bdfDB6A0f5c473dEc610144513bd071999fB",
    "0x3391bc034f2935ef0e1e41619445f998b2680d35",
    "0xcDdB1Bceb7a1979C6caa0229820707429dd3Ec6C",
    "0x28fAc5334C9f7262b3A3Fe707e250E01053e07b5",
    "0x42740698959761baf1b06baa51efbd88cb1d862b",
  ],
  polygon: [
    "0x8a999F5A3546F8243205b2c0eCb0627cC10003ab",
    "0x1ee6470CD75D5686d0b2b90C0305Fa46fb0C89A1",
    "0xfdA25D931258Df948ffecb66b5518299Df6527C4",
  ],
};

const trancheContracts = [
  "0xd0DbcD556cA22d3f3c142e9a3220053FD7a247BC",
  "0x77648a2661687ef3b05214d824503f6717311596",
];

function chainTvl(chain) {
  return async (time, ethBlock, chainBlocks) => {
    const block = chainBlocks[chain];
    const calls = {
      chain,
      block,
      calls: contracts[chain].map((c) => ({ target: c })),
    };
    const [tokenPrice, token, supply] = await Promise.all(
      [abi.tokenPrice, abi.token, "erc20:totalSupply"].map((abi) =>
        sdk.api.abi.multiCall({
          abi,
          ...calls,
        })
      )
    );
    const balances = {};
    tokenPrice.output.forEach((price, i) => {
      sdk.util.sumSingleBalance(
        balances,
        chain + ":" + token.output[i].output,
        BigNumber(price.output)
          .times(supply.output[i].output)
          .div(1e18)
          .toFixed(0)
      );
    });
    if (chain === "ethereum") {
      const [contractValue, trancheToken] = await Promise.all(
        [abi.getContractValue, abi.token].map((abi) =>
          sdk.api.abi.multiCall({
            abi,
            block,
            chain,
            calls: trancheContracts.map((c) => ({ target: c })),
          })
        )
      );
      contractValue.output.forEach((value, i) => {
        sdk.util.sumSingleBalance(
          balances,
          chain + ":" + trancheToken.output[i].output,
          value.output
        );
      });
    }
    return balances;
  };
}

module.exports = chainExports(chainTvl, Object.keys(contracts));
