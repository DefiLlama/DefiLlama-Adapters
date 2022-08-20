const retry = require('async-retry');
const axios = require('axios');
const { Program, Provider, web3 } = require('@project-serum/anchor');
const { NodeWallet } = require('./nodewallet');

const createFakeWallet = () => {
  const leakedKp = web3.Keypair.fromSecretKey(
    Uint8Array.from([
      208, 175, 150, 242, 88, 34, 108, 88, 177, 16, 168, 75, 115, 181, 199, 242, 120, 4, 78, 75, 19, 227, 13, 215, 184,
      108, 226, 53, 111, 149, 179, 84, 137, 121, 79, 1, 160, 223, 124, 241, 202, 203, 220, 237, 50, 242, 57, 158, 226,
      207, 203, 188, 43, 28, 70, 110, 214, 234, 251, 15, 249, 157, 62, 80,
    ]),
  );
  return new NodeWallet(leakedKp);
};

const returnAnchorProgram = async (programId, connection) => {
  const { data: idl } = await retry(async () => await axios.get('https://raw.githubusercontent.com/frakt-solana/frakt-sdk/master/src/loans/idl/nft_lending_v2.json'));
  return new Program(idl, programId, new Provider(connection, createFakeWallet(), Provider.defaultOptions()));
};

const decodedTimeBasedLiquidityPool = (decodedLiquidityPool, address) => ({
  amountOfStaked: decodedLiquidityPool.amountOfStaked.toNumber()
});

const decodedPriceBasedLiquidityPool = (decodedLiquidityPool, address) => ({
  amountOfStaked: decodedLiquidityPool.amountOfStaked.toNumber()
});

const decodedLoan = (decodedLoan, address) => ({
  loanStatus: Object.keys(decodedLoan.loanStatus)[0],
  originalPrice: decodedLoan.originalPrice.toNumber(),
});

module.exports = {
  createFakeWallet,
  returnAnchorProgram,
  decodedTimeBasedLiquidityPool,
  decodedPriceBasedLiquidityPool,
  decodedLoan
};
