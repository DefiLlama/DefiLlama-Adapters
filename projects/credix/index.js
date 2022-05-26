const { Connection, PublicKey } = require('@solana/web3.js')
const { Program, Provider, web3, utils } = require("@project-serum/anchor");
const { getAssociatedTokenAddress } = require("@solana/spl-token");
const { NodeWallet } = require("@project-serum/anchor/dist/cjs/provider");
const IDL = require("./credix.json");
const { toUSDTBalances } = require('../helper/balances')

const programId = new PublicKey("CRDx2YkdtYtGZXGHZ59wNv1EwKHQndnRc1gT4p8i2vPX");

const getProvider = async () => {
  /* create the provider and return it to the caller */
  /* network set to local network for now */
  const dummy_keypair = web3.Keypair.generate();
  const wallet = new NodeWallet(dummy_keypair);
  const network = "https://solana-api.projectserum.com/";
  const connection = new Connection(network, 'processed');
  const confirmOptions = {
    commitment: "processed",
    preflightCommitment: "processed",
  };

  const provider = new Provider(
    connection, wallet, confirmOptions
  );
  return provider;
}

const encodeSeedString = (seedString) => Buffer.from(utils.bytes.utf8.encode(seedString));

const constructProgram = async (provider) => {
  return new Program(IDL, programId, provider);
};

const findPDA = async (seeds) => {
  return PublicKey.findProgramAddress(seeds, programId);
};

const findGlobalMarketStatePDA = async (globalMarketSeed) => {
  const seed = encodeSeedString(globalMarketSeed);
  return findPDA([seed]);
};

const findSigningAuthorityPDA = async (globalMarketSeed) => {
  const globalMarketStatePDA = await findGlobalMarketStatePDA(globalMarketSeed);
  const seeds = [globalMarketStatePDA[0].toBuffer()];
  return findPDA(seeds);
};

const getAssociatedBaseTokenAddressPK = async (publicKey) => {
  const baseMintPK = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"); //USDC
  return await getAssociatedTokenAddress(
    baseMintPK,
    publicKey,
    true
  );
};

async function tvl() {
  const globalMarketSeed = "credix-marketplace"
  const provider = await getProvider();
  const signingAuthorityKey = await findSigningAuthorityPDA(globalMarketSeed)
  const liquidityPoolKey = await getAssociatedBaseTokenAddressPK(signingAuthorityKey[0]);
  const liquidityPool = await provider.connection.getTokenAccountBalance(liquidityPoolKey);
  const liquidityPoolBalance = liquidityPool.value.uiAmount;
  return toUSDTBalances(liquidityPoolBalance)
}

async function borrowed() {
  const globalMarketSeed = "credix-marketplace"
  const provider = await getProvider();
  const program = await constructProgram(provider);
  const globalMarketStatePDA = await findGlobalMarketStatePDA(globalMarketSeed);
  const globalMarketStateAccountData = await program.account.globalMarketState.fetch(globalMarketStatePDA[0]);
  const totalOutstandingCredit = Number(globalMarketStateAccountData.totalOutstandingCredit) / 1000000;
  return toUSDTBalances(totalOutstandingCredit)
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed
  }
};