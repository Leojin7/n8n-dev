import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { javaParams, apiSpecs, model, strategy, confidence } = body;

    console.log(`[SCM API] Analyzing and mapping with ${model} using ${strategy} strategy`);
    console.log(`[SCM API] Java params:`, javaParams);
    console.log(`[SCM API] API specs:`, apiSpecs);

    // Enhanced parameter mapping with detailed analysis
    const analysis = analyzeParameterMappings(javaParams, apiSpecs);

    return NextResponse.json({
      success: true,
      mappings: analysis.mappings,
      statistics: analysis.statistics,
      parameterDifferences: analysis.parameterDifferences,
      recommendations: analysis.recommendations
    });
  } catch (error) {
    console.error('[SCM API Error] analyze-and-map:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to analyze and map parameters'
    }, { status: 500 });
  }
}

function analyzeParameterMappings(javaParams: any, apiSpecs: any) {
  const localParams = Array.isArray(javaParams) ? javaParams : (javaParams.parameters || []);
  const officialParams = extractOfficialParameters(apiSpecs);

  console.log(`\n🎯 ===== SCM PARAMETER ANALYSIS =====`);
  console.log(`📁 Repository: ${javaParams.repoUrl || 'Unknown'}`);
  console.log(`🌿 Branch: ${javaParams.branch || 'main'}`);
  console.log(`📄 Files Found: ${javaParams.totalFiles || 0}`);
  console.log(`📊 Local Parameters: ${localParams.length}`);
  console.log(`🔗 Official Parameters: ${officialParams.length}`);
  console.log(`\n📋 LOCAL PARAMETERS:`);
  localParams.forEach((param: any, idx: any) => {
    console.log(`  ${idx + 1}. ${param.name} (${param.type}) - ${param.source || 'Unknown'}`);
  });
  console.log(`\n🔗 OFFICIAL PARAMETERS BY SCM:`);
  const paramsByScm = officialParams.reduce((acc: any, param: any) => {
    if (!acc[param.scm]) acc[param.scm] = [];
    acc[param.scm].push(param);
    return acc;
  }, {});
  Object.entries(paramsByScm).forEach(([scm, params]: [string, any]) => {
    console.log(`  ${scm.toUpperCase()}: ${params.length} parameters`);
    params.slice(0, 3).forEach((p: any) => console.log(`    - ${p.name} (${p.type})`));
    if (params.length > 3) console.log(`    ... and ${params.length - 3} more`);
  });
  console.log(`\n🔍 STARTING SEMANTIC MATCHING...`);

  const mappings = [];
  const differences = [];
  const recommendations = [];

  // Enhanced semantic matching with SCM-specific patterns
  for (const localParam of localParams) {
    console.log(`\n🔍 Analyzing: "${localParam.name}" (${localParam.type})`);

    const matches = findOfficialMatches(localParam, officialParams);

    if (matches.exact) {
      console.log(`  ✅ EXACT MATCH: "${localParam.name}" → "${matches.exact.name}" (${matches.exact.scm})`);
      mappings.push({
        javaParam: localParam.name,
        javaType: localParam.type,
        officialScm: matches.exact.scm || 'unknown',
        officialParam: matches.exact.name,
        officialType: matches.exact.type,
        matchType: 'EXACT',
        confidence: 1.0,
        reasoning: `Direct 1:1 match in ${matches.exact.scm} API`,
        apiEndpoint: matches.exact.endpoint || '',
        notes: `Use this exact parameter for ${matches.exact.scm} calls`
      });
    } else if (matches.semantic) {
      console.log(`  🟢 SEMANTIC MATCH: "${localParam.name}" → "${matches.semantic.name}" (${matches.semantic.scm}) - ${(matches.semantic.confidence * 100).toFixed(0)}% confidence`);
      mappings.push({
        javaParam: localParam.name,
        javaType: localParam.type,
        officialScm: matches.semantic.scm || 'unknown',
        officialParam: matches.semantic.name,
        officialType: matches.semantic.type,
        matchType: 'SEMANTIC',
        confidence: matches.semantic.confidence,
        reasoning: matches.semantic.reasoning,
        apiEndpoint: matches.semantic.endpoint || '',
        notes: `Consider using ${matches.semantic.name} instead of ${localParam.name}`
      });

      // Generate high-confidence recommendations
      if (matches.semantic.confidence > 0.8) {
        console.log(`  💡 RECOMMENDATION: Rename "${localParam.name}" to "${matches.semantic.name}" for ${matches.semantic.scm} compatibility`);
        recommendations.push({
          parameter: localParam.name,
          issue: `Parameter name doesn't match official ${matches.semantic.scm} API`,
          suggestion: `Rename "${localParam.name}" to "${matches.semantic.name}" for ${matches.semantic.scm} compatibility`,
          severity: 'high'
        });
      }
    } else {
      console.log(`  ❌ NO MATCH: "${localParam.name}" has no equivalent in official SCM APIs`);
      // No match found - this is a custom parameter
      mappings.push({
        javaParam: localParam.name,
        javaType: localParam.type,
        officialScm: 'none',
        officialParam: 'N/A',
        officialType: 'N/A',
        matchType: 'NO_MATCH',
        confidence: 0.0,
        reasoning: `No equivalent found in official SCM APIs`,
        apiEndpoint: '',
        notes: 'Custom implementation parameter'
      });

      differences.push({
        local: localParam.name,
        localType: localParam.type,
        localDescription: localParam.description,
        status: 'custom_or_unused',
        message: `"${localParam.name}" has no equivalent in official SCM APIs - may be custom implementation`,
        recommendation: 'Consider if this parameter is still needed or can be replaced with official API equivalent'
      });

      recommendations.push({
        parameter: localParam.name,
        issue: 'No official equivalent found in SCM APIs',
        suggestion: 'Review if this custom parameter is necessary or can be replaced with standard API parameters',
        severity: 'medium'
      });
    }
  }

  // Find official parameters that don't exist in local code
  console.log(`\n🔍 CHECKING FOR MISSING IMPLEMENTATIONS...`);
  for (const officialParam of officialParams) {
    const isMapped = mappings.some(m => m.officialParam === officialParam.name);
    if (!isMapped) {
      console.log(`  ⚠️ MISSING: "${officialParam.name}" (${officialParam.scm}) - not implemented in your code`);
      differences.push({
        official: officialParam.name,
        officialType: officialParam.type,
        officialDescription: officialParam.description,
        status: 'missing_implementation',
        message: `Official parameter "${officialParam.name}" is not implemented in your codebase`,
        recommendation: `Consider implementing "${officialParam.name}" to access full ${officialParam.scm} API functionality`
      });

      recommendations.push({
        parameter: officialParam.name,
        issue: `Missing official ${officialParam.scm} API parameter`,
        suggestion: `Implement "${officialParam.name}" to access additional ${officialParam.scm} functionality`,
        severity: 'low'
      });
    }
  }

  // Generate detailed statistics
  const statistics = {
    exact: mappings.filter(m => m.matchType === 'EXACT').length,
    semantic: mappings.filter(m => m.matchType === 'SEMANTIC').length,
    partial: mappings.filter(m => m.matchType === 'PARTIAL').length,
    noMatch: mappings.filter(m => m.matchType === 'NO_MATCH').length,
    total: mappings.length,
    avgConfidence: mappings.reduce((sum, m) => sum + m.confidence, 0) / mappings.length || 0
  };

  console.log(`\n📊 ANALYSIS RESULTS:`);
  console.log(`  • Exact Matches: ${statistics.exact}`);
  console.log(`  • Semantic Matches: ${statistics.semantic}`);
  console.log(`  • Partial Matches: ${statistics.partial}`);
  console.log(`  • No Match: ${statistics.noMatch}`);
  console.log(`  • Total: ${statistics.total}`);
  console.log(`  • Average Confidence: ${(statistics.avgConfidence * 100).toFixed(1)}%`);

  if (recommendations.length > 0) {
    console.log(`\n💡 RECOMMENDATIONS (${recommendations.length}):`);
    recommendations.forEach((rec, idx) => {
      const icon = rec.severity === 'high' ? '🔴' : rec.severity === 'medium' ? '🟡' : '🟢';
      console.log(`  ${idx + 1}. ${icon} ${rec.parameter}: ${rec.issue}`);
      console.log(`     → ${rec.suggestion}`);
    });
  }

  console.log(`\n🎯 ===== END ANALYSIS =====\n`);

  const detailedReport = generateDetailedReport(mappings, differences, statistics);

  return {
    mappings: {
      ...statistics,
      matches: mappings
    },
    statistics,
    parameterDifferences: differences,
    recommendations
  }
}

function extractOfficialParameters(apiSpecs: any) {
  const parameters: any[] = [];

  console.log("[SCM Analysis] Extracting from apiSpecs structure...");
  console.log("[SCM Analysis] API specs keys:", Object.keys(apiSpecs || {}));

  // Extract from the specs structure
  if (apiSpecs.specs && apiSpecs.specs.endpoints) {
    console.log("[SCM Analysis] Found specs.endpoints structure");

    apiSpecs.specs.endpoints.forEach((endpoint: any) => {
      if (endpoint.params && Array.isArray(endpoint.params)) {
        const path = endpoint.path.toLowerCase();
        let scm = 'unknown';

        // Detect SCM from path
        if (path.startsWith('/github/') || path.includes('github')) {
          scm = 'github';
        } else if (path.startsWith('/gitlab/') || path.includes('gitlab')) {
          scm = 'gitlab';
        } else if (path.startsWith('/bitbucket/') || path.includes('bitbucket')) {
          scm = 'bitbucket';
        }

        endpoint.params.forEach((paramName: string) => {
          parameters.push({
            name: paramName,
            type: inferParameterType(paramName, `Parameter for ${endpoint.method} ${endpoint.path}`),
            description: `Parameter for ${endpoint.method} ${endpoint.path}`,
            endpoint: endpoint.path,
            scm: scm
          });
        });
      }
    });
  }

  console.log(`[SCM Analysis] Extracted ${parameters.length} official parameters from ${parameters.filter(p => p.scm !== 'unknown').length} SCM platforms`);

  // Group by SCM for debugging
  const paramsByScm = parameters.reduce((acc: any, param: any) => {
    if (!acc[param.scm]) acc[param.scm] = [];
    acc[param.scm].push(param);
    return acc;
  }, {});

  Object.entries(paramsByScm).forEach(([scm, params]: [string, any]) => {
    console.log(`[SCM Analysis] ${scm.toUpperCase()}: ${params.length} parameters`);
    params.slice(0, 3).forEach((p: any) => console.log(`[SCM Analysis]   - ${p.name} (${p.type})`));
    if (params.length > 3) console.log(`[SCM Analysis]   ... and ${params.length - 3} more`);
  });

  return parameters;
}

function inferParameterType(paramName: string, context?: string): string {
  const name = paramName.toLowerCase();

  // AI-driven type inference based on semantic patterns
  const typeIndicators = {
    'integer': [
      'count', 'size', 'limit', 'offset', 'page', 'index', 'number', 'total',
      'id', 'length', 'height', 'width', 'depth', 'max', 'min', 'retry'
    ],
    'string': [
      'url', 'uri', 'link', 'path', 'name', 'title', 'description', 'key',
      'token', 'secret', 'hash', 'sha', 'slug', 'branch', 'tag', 'ref'
    ],
    'boolean': [
      'enabled', 'disabled', 'active', 'inactive', 'flag', 'is', 'has', 'can',
      'should', 'debug', 'verbose', 'public', 'private', 'force'
    ],
    'array': [
      'list', 'items', 'array', 'collection', 'entries', 'values', 'data'
    ]
  };

  // Check each type indicator
  for (const [type, indicators] of Object.entries(typeIndicators)) {
    if (indicators.some(indicator => name.includes(indicator))) {
      return type;
    }
  }

  // Context-aware inference
  if (context) {
    const ctx = context.toLowerCase();
    if (ctx.includes('authentication') || ctx.includes('auth')) return 'string';
    if (ctx.includes('pagination') || ctx.includes('paging')) return 'integer';
    if (ctx.includes('configuration') || ctx.includes('config')) return 'string';
    if (ctx.includes('logging') || ctx.includes('debug')) return 'boolean';
  }

  // Default to string for unknown parameters
  return 'string';
}

function findOfficialMatches(localParam: any, officialParams: any[]) {
  // Exact match
  const exact = officialParams.find(p => p.name.toLowerCase() === localParam.name.toLowerCase());
  if (exact) return { exact };

  // SCM-specific semantic patterns for better matching
  const scmPatterns = [
    // Pagination patterns
    { local: ['page_size', 'pagesize', 'limit', 'per_page'], official: ['per_page', 'page', 'limit', 'pagelen'], confidence: 0.9 },
    { local: ['offset', 'start', 'page'], official: ['offset', 'page', 'start'], confidence: 0.85 },
    { local: ['total_count', 'count', 'total', 'size'], official: ['size', 'count', 'total'], confidence: 0.9 },

    // Authentication patterns
    { local: ['api_token', 'token', 'auth_token', 'access_token'], official: ['token', 'access_token', 'api_key'], confidence: 0.85 },
    { local: ['api_key', 'key', 'secret'], official: ['api_key', 'key', 'secret'], confidence: 0.85 },

    // Repository patterns
    { local: ['repo_url', 'repository_url', 'git_url'], official: ['url', 'repository_url', 'clone_url'], confidence: 0.8 },
    { local: ['branch_name', 'branch', 'ref'], official: ['branch', 'ref', 'sha'], confidence: 0.9 },
    { local: ['commit_hash', 'sha', 'commit_id'], official: ['sha', 'commit', 'hash'], confidence: 0.9 },

    // General patterns
    { local: ['timeout_ms', 'timeout'], official: ['timeout', 'timeout_seconds'], confidence: 0.8 },
    { local: ['max_retries', 'retry_count'], official: ['max_retries', 'retry'], confidence: 0.85 },
    { local: ['api_endpoint', 'endpoint', 'base_url'], official: ['url', 'endpoint', 'base_url'], confidence: 0.8 }
  ];

  // Check SCM patterns first
  console.log(`[SCM Analysis] Checking patterns for "${localParam.name}" against ${officialParams.length} official params`);

  for (const pattern of scmPatterns) {
    const localMatch = pattern.local.some(p => localParam.name.toLowerCase().includes(p));
    console.log(`[SCM Analysis] Pattern ${pattern.local}: ${localMatch ? 'MATCH' : 'no match'} for "${localParam.name}"`);

    if (localMatch) {
      const match = officialParams.find(p =>
        pattern.official.some(o => p.name.toLowerCase().includes(o))
      );
      console.log(`[SCM Analysis] Official match found: ${match ? match.name : 'none'}`);

      if (match) {
        console.log(`[SCM Analysis] ✓ Semantic match: "${localParam.name}" → "${match.name}" (${match.scm})`);
        return {
          semantic: {
            ...match,
            confidence: pattern.confidence,
            reasoning: `SCM pattern match: "${localParam.name}" matches "${match.name}" in ${match.scm} API`
          }
        };
      }
    }
  }

  // Fallback to AI-driven semantic analysis
  const semanticMatches = [];

  for (const officialParam of officialParams) {
    const similarity = calculateSemanticSimilarity(localParam, officialParam);
    if (similarity > 0.5) { // Lowered threshold from 0.7 to 0.5
      semanticMatches.push({
        ...officialParam,
        confidence: similarity,
        reasoning: generateReasoning(localParam, officialParam, similarity)
      });
    }
  }

  // Return the best semantic match if found
  if (semanticMatches.length > 0) {
    const bestMatch = semanticMatches.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );
    return { semantic: bestMatch };
  }

  return {};
}

function calculateSemanticSimilarity(localParam: any, officialParam: any): number {
  let similarity = 0;

  // Name similarity (most important)
  const nameSimilarity = calculateStringSimilarity(
    localParam.name.toLowerCase(),
    officialParam.name.toLowerCase()
  );
  similarity += nameSimilarity * 0.6;

  // Type compatibility
  const typeCompatibility = calculateTypeCompatibility(localParam.type, officialParam.type);
  similarity += typeCompatibility * 0.2;

  // Description similarity (if available)
  if (localParam.description && officialParam.description) {
    const descSimilarity = calculateStringSimilarity(
      localParam.description.toLowerCase(),
      officialParam.description.toLowerCase()
    );
    similarity += descSimilarity * 0.2;
  }

  return Math.min(similarity, 1.0);
}

function calculateTypeCompatibility(localType: string, officialType: string): number {
  const normalizedLocal = normalizeType(localType);
  const normalizedOfficial = normalizeType(officialType);

  if (normalizedLocal === normalizedOfficial) return 1.0;

  // Compatible type mappings
  const compatibleTypes = {
    'string': ['string', 'text', 'varchar', 'char'],
    'integer': ['integer', 'int', 'number', 'long', 'short'],
    'boolean': ['boolean', 'bool', 'flag'],
    'array': ['array', 'list', 'collection']
  };

  for (const [baseType, variants] of Object.entries(compatibleTypes)) {
    if (variants.includes(normalizedLocal) && variants.includes(normalizedOfficial)) {
      return 0.8;
    }
  }

  return 0.2; // Low compatibility for completely different types
}

function normalizeType(type: string): string {
  const normalized = type.toLowerCase();
  if (normalized.includes('string') || normalized.includes('text')) return 'string';
  if (normalized.includes('int') || normalized.includes('long') || normalized.includes('short')) return 'integer';
  if (normalized.includes('bool') || normalized.includes('flag')) return 'boolean';
  if (normalized.includes('array') || normalized.includes('list')) return 'array';
  return normalized;
}

function generateReasoning(localParam: any, officialParam: any, similarity: number): string {
  const reasons = [];

  if (similarity > 0.8) {
    reasons.push(`Strong semantic similarity between "${localParam.name}" and "${officialParam.name}"`);
  } else if (similarity > 0.7) {
    reasons.push(`Moderate semantic similarity between "${localParam.name}" and "${officialParam.name}"`);
  }

  if (localParam.type && officialParam.type) {
    const typeCompat = calculateTypeCompatibility(localParam.type, officialParam.type);
    if (typeCompat > 0.7) {
      reasons.push(`Compatible types: ${localParam.type} ↔ ${officialParam.type}`);
    }
  }

  if (localParam.description && officialParam.description) {
    const descSim = calculateStringSimilarity(
      localParam.description.toLowerCase(),
      officialParam.description.toLowerCase()
    );
    if (descSim > 0.5) {
      reasons.push(`Similar descriptions suggest related functionality`);
    }
  }

  return reasons.join('; ');
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

function generateDetailedReport(mappings: any[], differences: any[], statistics: any) {
  let report = `# SCM Parameter Mapping Analysis Report\n\n`;
  report += `## Summary\n`;
  report += `- **Total Parameters Analyzed**: ${statistics.total}\n`;
  report += `- **Exact Matches**: ${statistics.exactMatches}\n`;
  report += `- **Semantic Matches**: ${statistics.semanticMatches}\n`;
  report += `- **Custom Parameters**: ${statistics.customParameters}\n`;
  report += `- **Missing Implementations**: ${statistics.missingImplementations}\n`;
  report += `- **Average Confidence**: ${(statistics.avgConfidence * 100).toFixed(1)}%\n\n`;

  if (mappings.length > 0) {
    report += `## Parameter Mappings\n\n`;
    for (const mapping of mappings) {
      report += `### ${mapping.matchType === 'exact' ? '✅' : '🔄'} ${mapping.local} → ${mapping.official}\n`;
      report += `- **Type**: ${mapping.localType} → ${mapping.officialType}\n`;
      report += `- **Confidence**: ${(mapping.confidence * 100).toFixed(1)}%\n`;
      report += `- **Description**: ${mapping.description}\n\n`;
    }
  }

  if (differences.length > 0) {
    report += `## Parameter Differences\n\n`;
    for (const diff of differences) {
      if (diff.status === 'custom_or_unused') {
        report += `### 📝 Custom Parameter: ${diff.local}\n`;
        report += `- **Type**: ${diff.localType}\n`;
        report += `- **Status**: No official equivalent found\n`;
        report += `- **Recommendation**: ${diff.recommendation}\n\n`;
      } else if (diff.status === 'missing_implementation') {
        report += `### ⚠️ Missing Implementation: ${diff.official}\n`;
        report += `- **Type**: ${diff.officialType}\n`;
        report += `- **Status**: Not found in your codebase\n`;
        report += `- **Recommendation**: ${diff.recommendation}\n\n`;
      }
    }
  } else {
    report += `## Parameter Differences\n\n`;
    report += `No parameter differences found.\n`;
  }

  return report;
}