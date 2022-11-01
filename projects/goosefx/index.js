const { sumTokens2, } = require('../helper/solana')

const GFX_TOKEN = 'GFX1ZjR2P15tmrSwow6FjyDYcEkoFb4p4gJCpLBjaxHD'

const programs = {
  CONTROLLER_PROGRAM_ID: '8KJx48PYGHVC9fxzRRtYp4x4CM2HyYCm2EjVuAP4vvrx',
  SSL_PROGRAM_ID: '7WduLbRfYhTJktjLw5FDEyrqoEv61aTTCuGAetgLjzN5',
  GFX_CONTROLLER: '8CxKnuJeoeQXFwiG6XiGY2akBjvJA5k3bE52BfnuEmNQ'
}

async function tvl() {
  return sumTokens2({ tokenAccounts: ["GfKM5yKppizEG91Sm2Xtwk8XJG5se2E2vimXP7qZfqzt","77PYoAUcS8uiQDoqd8miT8PfYHgzzAXnQDRVVvo9Dp7U","8ZtBSY3h3D5J8mNtHswtESwJXzNRTUVpUdVPS91R95Nh","4sYi8fvNoRqg8VXgFmsWjoWT2b2icZ6mdsiTjKKy6jWn","BMzD7Ni8ZZRm49n2zScBTz5HVdR9SNzm26MTo8ZkFyHF","3vFaMhtLT86TbXi5Hik66U8rffoP7FrLFeNSpvMWwJvY","GeznfKFQoVawp4mXu2rAQkdMBy5TAoWg32gF2xaYqrTJ","GSBNJWb9cfvL5TwHAsJQa5ujejaYNZVTru8BhLR75eMD", "4QvXemwYtNB7urqYE742ertcM93Qbc4L4qmy8oiKP3gY"] })
}

async function staking() {

  return sumTokens2({ owner: programs.GFX_CONTROLLER, tokens: [GFX_TOKEN] })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl, staking,
  },
}
