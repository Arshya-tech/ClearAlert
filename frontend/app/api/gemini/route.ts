import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { alertType, severity, userProfile, location } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Build profile description
    let profileDescription = 'general public'
    if (userProfile) {
      const parts: string[] = []
      if (userProfile.ageGroup === 'student') parts.push('college student')
      else if (userProfile.ageGroup === 'senior') parts.push('senior citizen')
      else if (userProfile.ageGroup === 'adult') parts.push('working professional')
      
      if (userProfile.householdType === 'small-family' || userProfile.householdType === 'large-family') {
        parts.push('with a family')
      }
      if (userProfile.gender === 'female') parts.push('woman')
      if (userProfile.specialConditions?.includes('medical-needs')) parts.push('with medical needs')
      if (userProfile.specialConditions?.includes('mobility-issues')) parts.push('with mobility concerns')
      if (userProfile.specialConditions?.includes('young-children')) parts.push('with young children')
      if (userProfile.specialConditions?.includes('pets')) parts.push('with pets')
      if (userProfile.specialConditions?.includes('elderly-care')) parts.push('caring for elderly family members')
      
      if (parts.length > 0) {
        profileDescription = parts.join(', ')
      }
    }

    // Map severity to friendly text
    const severityMap: Record<string, string> = {
      low: 'Green (Low)',
      moderate: 'Yellow (Moderate)',
      severe: 'Orange (Severe)',
      extreme: 'Red (Extreme)',
    }
    const severityText = severityMap[severity] || severity

    const prompt = `You are a calm, supportive emergency preparedness assistant. Generate personalized emergency guidance for the following situation:

**Alert Type:** ${alertType}
**Severity Level:** ${severityText}
**Location:** ${location || 'Not specified'}
**User Profile:** ${profileDescription}

Please provide:

1. **Brief Explanation** (2-3 sentences): Explain what this alert means in simple, non-alarmist language. Be reassuring but informative.

2. **Personalized Preparedness Checklist** (4-6 items): Provide specific, actionable steps tailored to the user's profile. Use bullet points.

Format your response EXACTLY as follows (use these exact headers):

## What This Means
[Your brief explanation here]

## Your Personalized Checklist
- [Action item 1]
- [Action item 2]
- [Action item 3]
- [Action item 4]

Keep the tone calm, supportive, and empowering. Avoid causing panic.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Gemini API error:', error)
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return NextResponse.json({ content: generatedText })
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
