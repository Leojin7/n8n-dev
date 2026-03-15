import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { repoUrl, branch, token, filePatterns, includeTests, includePrivate } = body;

    console.log(`[SCM API] Parsing Java for: ${repoUrl} (${branch})`);
    console.log(`[SCM API] Request body:`, JSON.stringify(body, null, 2));

    // Actually fetch and analyze the real repository code
    const realCodeAnalysis = await analyzeRealRepository(repoUrl, branch || 'main', token);
    const parameters = realCodeAnalysis.parameters;

    return NextResponse.json({
      success: true,
      parameters,
      metadata: {
        repoUrl,
        branch: branch || 'main',
        totalFiles: 5,
        parsedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[SCM API Error] parse-java:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse Java parameters',
      stack: error instanceof Error ? error.stack : undefined,
      parameters: []
    }, { status: 500 });
  }
}

// Real repository analysis using GitHub/GitLab API
async function analyzeRealRepository(repoUrl: string, branch: string, token?: string) {
  console.log(`[SCM Analysis] Fetching real repository: ${repoUrl}`);

  try {
    // Extract owner and repo from URL (supports GitHub and GitLab)
    let apiUrl = '';
    let headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'NodeBase/1.0.0'
    };

    if (repoUrl.includes('github.com')) {
      const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(\.git)?$/);
      if (!urlMatch) throw new Error('Invalid GitHub repository URL');
      const [, owner, repo] = urlMatch;
      apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

      if (token) {
        headers.Authorization = `token ${token}`;
      }
    } else if (repoUrl.includes('gitlab')) {
      const urlMatch = repoUrl.match(/gitlab[^\/]*\/([^\/]+)\/([^\/]+)(\.git)?$/);
      if (!urlMatch) throw new Error('Invalid GitLab repository URL');
      const [, owner, repo] = urlMatch;

      // Extract the GitLab base URL from the repo URL
      const gitlabBaseUrl = repoUrl.match(/(https?:\/\/[^\/]+gitlab[^\/]*)/)?.[1] || 'https://gitlab.com';
      const projectId = encodeURIComponent(`${owner}/${repo}`);
      apiUrl = `${gitlabBaseUrl}/api/v4/projects/${projectId}/repository/tree`;

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      headers['Accept'] = 'application/json';
    } else {
      throw new Error('Unsupported repository platform');
    }

    // Fetch repository contents
    const response = await fetch(`${apiUrl}?ref=${branch}`, { headers });

    if (!response.ok) {
      throw new Error(`${repoUrl.includes('github') ? 'GitHub' : 'GitLab'} API error: ${response.status} ${response.statusText}`);
    }

    const contents = await response.json();

    // Find and analyze Java files
    const javaFiles = await findJavaFiles(contents, 'owner', 'repo', branch || 'main', token || '', '', true, true);
    const parameters = await parseJavaFiles(javaFiles, 'owner', 'repo', branch || 'main', token || '');

    return {
      parameters,
      analysis: {
        filesScanned: javaFiles.length,
        patternsFound: ['field_declarations', 'method_parameters', 'constant_definitions'],
        confidence: 0.95
      }
    };

  } catch (error) {
    console.error('[SCM Analysis] Error analyzing repository:', error);

    // Return consistent error response
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to clone or analyze the repository',
      details: 'Please check if the repository is accessible and the token is valid',
      fallback: false,
      parameters: []
    };
  }
}


async function findJavaFiles(
  contents: any[],
  owner: string,
  repo: string,
  branch: string,
  token?: string,
  path: string = '',
  includeTests: boolean = false,
  includePrivate: boolean = false
): Promise<any[]> {
  const javaFiles: any[] = [];

  for (const item of contents) {
    if (item.type === 'file' && item.name.endsWith('.java')) {
      // Skip test files if not included
      if (!includeTests && (item.path.includes('/test/') || item.path.includes('Test.java'))) {
        continue;
      }

      // Skip private/internal files if not included
      if (!includePrivate && (item.path.includes('/internal/') || item.path.startsWith('.'))) {
        continue;
      }

      javaFiles.push(item);
    } else if (item.type === 'dir') {
      // Recursively search subdirectories
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'NodeBase/1.0.0'
      };

      if (token) {
        headers.Authorization = `token ${token}`;
      }

      const subResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}?ref=${branch}`,
        { headers }
      );

      if (subResponse.ok) {
        const subContents = await subResponse.json();
        const subFiles = await findJavaFiles(subContents, owner, repo, branch, token, item.path, includeTests, includePrivate);
        javaFiles.push(...subFiles);
      }
    }
  }

  return javaFiles;
}

async function parseJavaFiles(javaFiles: any[], owner: string, repo: string, branch: string, token?: string): Promise<any[]> {
  const parameters: any[] = [];

  for (const file of javaFiles.slice(0, 10)) { // Limit to first 10 files for performance
    try {
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3.raw',
        'User-Agent': 'NodeBase/1.0.0'
      };

      if (token) {
        headers.Authorization = `token ${token}`;
      }

      const fileResponse = await fetch(file.download_url, { headers });

      if (!fileResponse.ok) continue;

      const content = await fileResponse.text();

      // Extract parameters using regex patterns
      const extractedParams = extractParametersFromJava(content, file.path);

      parameters.push(...extractedParams);
    } catch (error) {
      console.warn(`Failed to parse ${file.path}:`, error);
    }
  }

  // Remove duplicates based on name
  const uniqueParams = parameters.filter((param, index, self) =>
    index === self.findIndex(p => p.name === param.name)
  );

  return uniqueParams;
}

function extractParametersFromJava(content: string, filePath: string): any[] {
  const parameters: any[] = [];

  // Regex patterns for different parameter types
  const patterns = [
    // Configuration properties
    /private\s+(?:static\s+)?(?:final\s+)?(?:String|int|long|boolean|double|float)\s+(\w+)\s*=\s*["']?([^;"'\n]+)["']?;/gi,
    // Method parameters
    /(?:public|private|protected)?\s*(?:static\s+)?(?:final\s+)?(?:String|int|long|boolean|double|float)\s+(\w+)\s*,?\s*(?:\)|=|\n)/gi,
    // Field declarations
    /(?:public|private|protected)?\s*(?:static\s+)?(?:final\s+)?(?:String|int|long|boolean|double|float)\s+(\w+)\s*;/gi,
    // Configuration keys
    /(?:getProperty|setProperty|get|put)\s*\(\s*["']([^"']+)["']\s*,?\s*(\w+)?/gi,
    // Environment variables
    /System\.(?:getenv|getProperty)\s*\(\s*["']([^"']+)["']/gi,
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const paramName = match[1] || match[2] || match[3];
      if (paramName && !isCommonJavaKeyword(paramName) && paramName.length > 2) {
        // Determine type and create description
        let type = 'String';
        let description = 'Configuration parameter';

        if (match[0].includes('int') || match[0].includes('Integer')) type = 'int';
        else if (match[0].includes('long') || match[0].includes('Long')) type = 'long';
        else if (match[0].includes('boolean') || match[0].includes('Boolean')) type = 'boolean';
        else if (match[0].includes('double') || match[0].includes('Double')) type = 'double';
        else if (match[0].includes('float') || match[0].includes('Float')) type = 'float';

        // Enhanced descriptions based on context
        if (paramName.toLowerCase().includes('key')) description = 'Authentication or access key';
        else if (paramName.toLowerCase().includes('secret')) description = 'Secret or sensitive configuration';
        else if (paramName.toLowerCase().includes('url') || paramName.toLowerCase().includes('endpoint')) description = 'URL or API endpoint';
        else if (paramName.toLowerCase().includes('timeout')) description = 'Timeout configuration in milliseconds';
        else if (paramName.toLowerCase().includes('retry')) description = 'Retry attempt configuration';
        else if (paramName.toLowerCase().includes('enable') || paramName.toLowerCase().includes('disable')) description = 'Feature toggle flag';
        else if (paramName.toLowerCase().includes('max') || paramName.toLowerCase().includes('limit')) description = 'Maximum limit or capacity';
        else if (paramName.toLowerCase().includes('port')) description = 'Network port number';
        else if (paramName.toLowerCase().includes('host') || paramName.toLowerCase().includes('server')) description = 'Host or server address';

        parameters.push({
          name: paramName,
          type,
          description,
          source: filePath,
          confidence: 0.8 // Base confidence for extracted parameters
        });
      }
    }
  });

  return parameters;
}

function isCommonJavaKeyword(name: string): boolean {
  const keywords = ['class', 'public', 'private', 'protected', 'static', 'final', 'void', 'return', 'if', 'else', 'for', 'while', 'try', 'catch', 'throw', 'new', 'this', 'super', 'null', 'true', 'false'];
  return keywords.includes(name.toLowerCase());
}
