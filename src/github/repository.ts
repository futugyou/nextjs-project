
import { Octokit } from "octokit"
interface RepositoryNode {
  name: string;
}

interface RepositoryResponse {
  organization: {
    repositories: {
      nodes: RepositoryNode[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  };
}

export const getRepository = async () => {
  const octokit = new Octokit({ auth: `${process.env.GPT}` })

  const result = await octokit.graphql.paginate<RepositoryResponse>(`
        query paginate($cursor: String, $owner: String!) {
            organization(login: $owner) {
              repositories(first: 100, orderBy: {field: NAME, direction: ASC}, after: $cursor) {
                nodes {
                  name
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
        }
        `,
    {
      owner: `${process.env.REPO_OWNER}`,
    },
  )

  return result.organization.repositories.nodes.map(repo => repo.name)
}