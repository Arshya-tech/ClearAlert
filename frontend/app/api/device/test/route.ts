import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Simulate device test execution time
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const { type } = await request.json()

  // In production, this would send a command to the Raspberry Pi
  // and return the actual result
  const success = Math.random() > 0.1 // 90% success rate for demo

  return NextResponse.json({
    success,
    type,
    message: success
      ? `${type === 'led' ? 'LED' : 'Audio'} test completed successfully`
      : `${type === 'led' ? 'LED' : 'Audio'} test failed - device may be busy`,
  })
}
