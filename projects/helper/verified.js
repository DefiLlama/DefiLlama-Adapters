const { getEnv } = require("../helper/env");

async function getVerifiedProject(projectId) {
  const res = await fetch(`${getEnv('LLAMA_VERIFIED_API')}/${projectId}/current`);
  const body = await res.json();
  return body.data;
}

module.exports = {
  getVerifiedProject,
}
