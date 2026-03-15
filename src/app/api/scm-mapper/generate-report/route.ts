import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mappings, formats } = body;

    console.log(`[SCM API] Generating reports in formats: ${formats?.join(', ') || 'none'}`);

    const results = {
      markdown: "# SCM Mapping Report\n\n## Summary\n- Total: " + (mappings?.total || 0) + "\n- Confidence: " + ((mappings?.avgConfidence || 0) * 100) + "%\n",
      json: mappings || {},
      html: "<html><body><h1>SCM Mapping Report</h1></body></html>"
    };

    return NextResponse.json({ 
      success: true, 
      ...results
    });
  } catch (error) {
    console.error('[SCM API Error] generate-report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
