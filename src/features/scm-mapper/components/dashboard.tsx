import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, BarChart3, Eye } from "lucide-react";

interface SCMMapperDashboardProps {
  results: any[];
}

const SCMResultSummary: React.FC<{ result: any }> = ({ result }) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Execution Details</h4>
          <div className="text-sm space-y-1">
            <div><strong>ID:</strong> {result.id}</div>
            <div><strong>Workflow:</strong> {result.workflowId}</div>
            <div><strong>Created:</strong> {new Date(result.createdAt).toLocaleString()}</div>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Statistics</h4>
          <div className="text-sm space-y-1">
            <div><strong>Total Parameters:</strong> {result.javaParamsCount || 0}</div>
            <div><strong>Exact Matches:</strong> {result.statistics?.exact || 0}</div>
            <div><strong>Semantic Matches:</strong> {result.statistics?.semantic || 0}</div>
            <div><strong>Avg Confidence:</strong> {((result.statistics?.avgConfidence || 0) * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Repository Info */}
      {result.javaParams?.metadata?.repoUrl && (
        <div className="border-t pt-3">
          <h4 className="font-semibold mb-2">Repository Processed</h4>
          <div className="text-sm space-y-1">
            <div><strong>URL:</strong> {result.javaParams.metadata.repoUrl}</div>
            <div><strong>Branch:</strong> {result.javaParams.metadata.branch}</div>
            <div><strong>Files Found:</strong> {result.javaParams.metadata.totalFiles || 0}</div>
          </div>
        </div>
      )}

      {/* Java Parameters */}
      {result.javaParams?.parameters && result.javaParams.parameters.length > 0 && (
        <div className="border-t pt-3">
          <h4 className="font-semibold mb-2">Java Parameters Found ({result.javaParams.parameters.length})</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {result.javaParams.parameters.map((param: any, idx: number) => (
              <div key={idx} className="bg-white p-2 rounded border-l-4 border-blue-500 text-sm">
                <div className="font-medium">{param.name}</div>
                <div className="text-gray-600">
                  <strong>Type:</strong> {param.type} | <strong>Source:</strong> {param.source}
                </div>
                <div className="text-gray-500 text-xs mt-1">{param.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parameter Mappings */}
      {result.mappings?.matches && result.mappings.matches.length > 0 && (
        <div className="border-t pt-3">
          <h4 className="font-semibold mb-2">Parameter Mappings ({result.mappings.matches.length})</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {result.mappings.matches.map((match: any, idx: number) => (
              <div key={idx} className="bg-green-50 p-2 rounded border-l-4 border-green-500 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{match.local}</div>
                  <Badge variant="secondary">{match.type}</Badge>
                </div>
                <div className="text-gray-600">
                  <strong>Maps to:</strong> {match.remote || 'No match'}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  Confidence: {((match.confidence || 0) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parameter Differences */}
      {result.mappings?.parameterDifferences && result.mappings.parameterDifferences.length > 0 && (
        <div className="border-t pt-3">
          <h4 className="font-semibold mb-2">Parameter Differences ({result.mappings.parameterDifferences.length})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {result.mappings.parameterDifferences.map((diff: any, idx: number) => (
              <div key={idx} className={`p-2 rounded border-l-4 text-sm ${diff.status === 'custom_or_unused'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-red-50 border-red-500'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {diff.status === 'custom_or_unused' ? `📝 ${diff.local}` : `⚠️ ${diff.official}`}
                  </div>
                  <Badge variant={diff.status === 'custom_or_unused' ? 'secondary' : 'destructive'}>
                    {diff.status === 'custom_or_unused' ? 'Custom' : 'Missing'}
                  </Badge>
                </div>
                <div className="text-gray-600 text-xs mt-1">{diff.message}</div>
                <div className="text-gray-500 text-xs mt-1 italic">{diff.recommendation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.mappings?.recommendations && result.mappings.recommendations.length > 0 && (
        <div className="border-t pt-3">
          <h4 className="font-semibold mb-2">Recommendations ({result.mappings.recommendations.length})</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {result.mappings.recommendations.map((rec: any, idx: number) => (
              <div key={idx} className="bg-blue-50 p-2 rounded border-l-4 border-blue-500 text-sm">
                <div className="font-medium">
                  {rec.type === 'parameter_rename' ? `🔄 Rename: ${rec.local} → ${rec.suggested}` : `💡 ${rec.type}`}
                </div>
                <div className="text-gray-600 text-xs mt-1">{rec.reason}</div>
                <div className="text-gray-500 text-xs mt-1">
                  Confidence: {((rec.confidence || 0) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const SCMMapperDashboard: React.FC<SCMMapperDashboardProps> = ({ results }) => {
  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
          </CardContent>
        </Card>
        {/* Add more summary cards here */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Analysis Results</CardTitle>
          <CardDescription>
            Historical record of SCM Mapper executions and their matching statistics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Total Params</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Avg Confidence</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created At</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {results.map((result) => (
                  <React.Fragment key={result.id}>
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-mono text-xs">{result.id}</td>
                      <td className="p-4 align-middle">
                        {result.status === 'success' ? (
                          <div className="flex items-center text-green-600"><CheckCircle2 className="mr-1 h-4 w-4" /> Success</div>
                        ) : (
                          <div className="flex items-center text-red-600"><AlertCircle className="mr-1 h-4 w-4" /> Error</div>
                        )}
                      </td>
                      <td className="p-4 align-middle">{result.javaParamsCount || 0}</td>
                      <td className="p-4 align-middle">
                        {((result.statistics?.avgConfidence || 0) * 100).toFixed(1)}%
                      </td>
                      <td className="p-4 align-middle">
                        {new Date(result.createdAt).toLocaleString()}
                      </td>
                    </tr>
                    {result.javaParamsCount > 0 && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <SCMResultSummary result={result} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
