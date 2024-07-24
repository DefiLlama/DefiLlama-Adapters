const { getProvider, sumTokens2 } = require("../helper/solana");
const { Program } = require("@project-serum/anchor");
const { SplTokenStakingIDLV0, SplTokenStakingIDLV1 } = require("./idl");

const SplTokenStakingProgramIdV0 =
  "STAKEkKzbdeKkqzKpLkNQD3SUuLgshDKCD7U8duxAbB";
const SplTokenStakingProgramIdV1 =
  "STAKEGztX7S1MUHxcQHieZhELCntb9Ys9BgUbeEtMu1";

async function tvl() {
  const anchorProvider = getProvider();
  const armadaStakingV0 = new Program(
    SplTokenStakingIDLV0,
    SplTokenStakingProgramIdV0,
    anchorProvider
  );
  const armadaStakingV1 = new Program(
    SplTokenStakingIDLV1,
    SplTokenStakingProgramIdV1,
    anchorProvider
  );
  const [stakePoolsV0, stakePoolsV1] = await Promise.all([
    armadaStakingV0.account.stakePool.all(),
    armadaStakingV1.account.stakePool.all(),
  ]);
  return sumTokens2({ tokenAccounts: [stakePoolsV0, stakePoolsV1].flat().map((sp) => sp.account.vault), });
}

module.exports = {
  timetravel: false,
  solana: {
    tvl: () => ({}),
    staking: tvl,
  },
};
