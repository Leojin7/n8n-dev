import { NextResponse } from 'next/server';
import Prismadb from '@/lib/db';

export async function GET() {
  try {
    const latestResults = await Prismadb.sCMMapperResult.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    });

    return NextResponse.json({
      success: true,
      results: latestResults.map(result => ({
        id: result.id,
        workflowId: result.workflowId,
        javaParamsCount: result.javaParamsCount,
        statistics: result.statistics,
        status: result.status,
        createdAt: result.createdAt,
        javaParams: result.javaParams,
        mappings: result.mappings,
        apiSpecs: result.apiSpecs
      }))
    });
  } catch (error) {
    console.error('Error fetching SCM results:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
