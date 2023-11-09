
import { Octokit } from "octokit"

export const getRepository = async () => {
    const octokit = new Octokit({ auth: `${process.env.GPT}` })

    const { organization } = await octokit.graphql.paginate(`
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
    
    return organization.repositories.nodes.map((o: any) => o.name)
}