const octokit = require("./client");

const getOrgRepos = org => {
  const options = octokit.search.repos.endpoint.merge({
    q: `user:${org} archived:false fork:true`
  });
  return octokit.paginate.iterator(options);
};

const getUserRepos = () => {
  const options = octokit.repos.list.endpoint.DEFAULTS;
  return octokit.paginate.iterator(options);
};

async function* reposFromResponses(responses) {
  for await (const response of responses) {
    for (const repo of response.data) {
      if (repo.archived) {
        continue;
      }

      yield repo;
    }
  }
}

// org is optional
const getRepos = org => {
  let responses;
  if (org) {
    responses = getOrgRepos(org);
  } else {
    responses = getUserRepos();
  }
  return reposFromResponses(responses);
};

module.exports = { getRepos };
