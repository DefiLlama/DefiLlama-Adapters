const { sumTokens2, } = require('../helper/solana')

async function tvl() {
  return sumTokens2({ tokenAccounts: ["ALfS4oPB5684XwTvCjWw7XddFfmyTNdcY7xHxbh2Ui8s", "8cMk8SxSY6b3a4wGhEF5rgXfsmUuqwPqpqhkH7z1gvXZ","6hDS2kFxSJCHcgX3WYwPULzrQrhSSQWTVDfxAToLKsAv","HJuwvd1bBPWr1fV1EKNnzgR7Kn3znU2WzwiGphb8Mv92", "Af6DjX1eRjfmnF1Lfe99FTgLUMKTVrsyf7CY2Kx9kzbT", "DA2nEQnCZFGhAZSQ5jKUHL4REPG57ixEMeTQAfWuWmJX", "294A1PmDuLHrmgcPKHoQd9GgrJxQ6y2WkpPhSVgbkUoD"] })
}

async function staking() {
  return sumTokens2({ tokenAccounts: ['24dximAcSUp1aM3uyQ7Cdpsg128ZVpYRwJBz5k4P6HMc'] })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl, staking,
  },
}