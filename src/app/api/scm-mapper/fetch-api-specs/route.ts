import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apis } = body;

    console.log(`[SCM API] Fetching specs for: ${apis?.join(', ') || 'default APIs'}`);

    // Enhanced API specifications with multiple SCM platforms
    const specs = {
      versions: ["v1", "v2"],
      endpoints: [
        // GitHub API endpoints
        {
          path: "/github/repos/{owner}/{repo}",
          method: "GET",
          params: ["size", "page", "limit", "sort", "per_page", "token", "access_token"]
        },
        {
          path: "/github/repos/{owner}/{repo}/commits",
          method: "GET",
          params: ["sha", "per_page", "page", "token", "access_token"]
        },
        {
          path: "/github/repos/{owner}/{repo}/pulls",
          method: "GET",
          params: ["state", "head", "base", "sort", "per_page", "token", "access_token"]
        },
        // GitLab API endpoints
        {
          path: "/gitlab/projects/{id}/repository",
          method: "GET",
          params: ["size", "page", "per_page", "sort", "order_by", "token", "private_token"]
        },
        {
          path: "/gitlab/projects/{id}/repository/commits",
          method: "GET",
          params: ["ref_name", "per_page", "page", "token", "private_token"]
        },
        {
          path: "/gitlab/projects/{id}/merge_requests",
          method: "GET",
          params: ["state", "order_by", "sort", "per_page", "token", "private_token"]
        },
        // Bitbucket API endpoints
        {
          path: "/bitbucket/repositories/{workspace}",
          method: "GET",
          params: ["size", "page", "pagelen", "sort", "token", "access_token"]
        },
        {
          path: "/bitbucket/repositories/{workspace}/{repo_slug}/commits",
          method: "GET",
          params: ["include", "exclude", "pagelen", "token", "access_token"]
        },
        {
          path: "/bitbucket/repositories/{workspace}/{repo_slug}/pullrequests",
          method: "GET",
          params: ["state", "q", "sort", "pagelen", "token", "access_token"]
        }
      ],
      official_docs: "https://docs.github.com/en/rest, https://docs.gitlab.com/ee/api/, https://developer.atlassian.com/bitbucket/api/2/reference/"
    };

    return NextResponse.json({
      success: true,
      specs,
      apis
    });
  } catch (error) {
    console.error('[SCM API Error] fetch-api-specs:', error);
    return NextResponse.json({ error: 'Failed to fetch API specs' }, { status: 500 });
  }
}
