const sdk = require("@defillama/sdk");
const abi = require("./abis");

const XETH = "0x6CC71cD03a70b4eF06d688716F611cE368f80530";
const XNFT = "0x7349734081FA4DBEC26B9D16C45b3A73Eb4B0Cba";
const PRICEORACLE = "0x4EC0b74587CA473d803d8F6a6f02E7E4c2f83A06";
const NFT_ARRAY = ["0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d", "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb", "0x23581767a106ae21c074b2276d25e5c3e136a68b", "0x60e4d786628fea6478f785a6d7e704777c86a7c6", "0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b", "0xed5af388653567af2f388e6224dc7c4b3241c544", "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e", "0x7d9e921c8334486732918fB3a034Df44538eb57E"];

async function getTVL(balances, chain, timestamp, chainBlocks) {
  const block = chainBlocks[chain];
  const {output : ethBalance } = await sdk.api.eth.getBalance({ target: XETH, block, chain, })

  const [{ output: price }, { output: balanceOf }] = await Promise.all([
    sdk.api.abi.multiCall({
      calls: NFT_ARRAY.map((address) => ({
        target: PRICEORACLE,
        params: [address, "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"],
      })),
      abi: abi.PRICEORACLE_ABI,
      block,
      chain,
    }),
    sdk.api.abi.multiCall({
      calls: NFT_ARRAY.map((address) => ({
        target: address,
        params: [XNFT],
      })),
      abi: abi.ERC721_ABI,
      block,
      chain,
    })
  ]);

  let collateralValue = 0;
  for(let i=0; i<NFT_ARRAY.length; i++){
    collateralValue += price[i].output * balanceOf[i].output;
  }

  balances.ethereum = (+ethBalance + +collateralValue)/1e18;
  return balances;
}

async function getBorrowed(balances, chain, timestamp, chainBlocks) {
  const block = chainBlocks[chain];

  const [{ output: borrowed }] = await Promise.all([
    sdk.api.abi.call({
      target: XETH,
      params: [],
      abi: abi.XETH_ABI,
      block,
      chain,
    }),
  ]);

  balances.ethereum = borrowed / 1e18;

  return balances;
}

module.exports = {
  getTVL,
  getBorrowed,
};
