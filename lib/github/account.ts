
import { Octokit, App } from "octokit"

export const getAccountPermission = async () => {
    const octokit = new Octokit({ auth: `${process.env.GPT}` })
    const { data: { login }, headers } = await octokit.rest.users.getAuthenticated()
    if (headers["x-oauth-scopes"]) {
        return { username: login, permission: headers["x-oauth-scopes"] }
    }
    return { username: login, permission: "" }
}