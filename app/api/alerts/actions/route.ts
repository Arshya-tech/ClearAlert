import { NextResponse } from 'next/server'
import type { ActionCard, AlertType, AgeGroup, HouseholdType, SpecialCondition } from '@/lib/types'

interface PersonalizedAction extends Omit<ActionCard, 'alertId'> {
  forAgeGroups?: AgeGroup[]
  forHouseholds?: HouseholdType[]
  forConditions?: SpecialCondition[]
}

// Base action cards mapped by alert type
const baseActionsByType: Record<string, PersonalizedAction[]> = {
  tornado: [
    {
      id: 'tornado-1',
      icon: 'home',
      instruction: 'Go to your basement or an interior room on the lowest floor',
      whyItMatters: 'Basements and interior rooms provide the most protection from flying debris and structural collapse during a tornado.',
      priority: 1,
    },
    {
      id: 'tornado-2',
      icon: 'shield',
      instruction: 'Cover yourself with a mattress or heavy blankets',
      whyItMatters: 'This provides additional protection from falling debris and broken glass.',
      priority: 2,
    },
    {
      id: 'tornado-3',
      icon: 'car',
      instruction: 'If driving, do not try to outrun the tornado. Find shelter immediately.',
      whyItMatters: 'Vehicles offer little protection and can be thrown by tornado-force winds.',
      priority: 3,
    },
  ],
  thunderstorm: [
    {
      id: 'storm-1',
      icon: 'home',
      instruction: 'Move to the lowest floor of your building immediately',
      whyItMatters: 'The lowest floor provides the most protection from falling debris.',
      priority: 1,
    },
    {
      id: 'storm-2',
      icon: 'shield',
      instruction: 'Stay away from windows, glass doors, and skylights',
      whyItMatters: 'High winds can shatter glass and turn it into dangerous projectiles.',
      priority: 2,
    },
    {
      id: 'storm-3',
      icon: 'battery',
      instruction: 'Charge your devices and have backup power ready',
      whyItMatters: 'Power outages are common during severe storms.',
      priority: 3,
    },
  ],
  flood: [
    {
      id: 'flood-1',
      icon: 'home',
      instruction: 'Move to higher ground immediately if water is rising',
      whyItMatters: 'Floodwaters can rise rapidly and become life-threatening within minutes.',
      priority: 1,
    },
    {
      id: 'flood-2',
      icon: 'car',
      instruction: "Never drive through flooded roads - Turn Around, Don't Drown",
      whyItMatters: 'Just 6 inches of moving water can knock you down. Two feet of water can float a car.',
      priority: 2,
    },
    {
      id: 'flood-3',
      icon: 'water',
      instruction: 'Do not drink flood water - use bottled or boiled water',
      whyItMatters: 'Floodwater may contain sewage, chemicals, and other contaminants.',
      priority: 3,
    },
  ],
  heat: [
    {
      id: 'heat-1',
      icon: 'home',
      instruction: 'Stay in air-conditioned spaces as much as possible',
      whyItMatters: 'Air conditioning is the most effective way to prevent heat-related illness.',
      priority: 1,
    },
    {
      id: 'heat-2',
      icon: 'water',
      instruction: "Drink plenty of water, even if you don't feel thirsty",
      whyItMatters: 'During extreme heat, your body loses fluids faster than normal.',
      priority: 2,
    },
    {
      id: 'heat-3',
      icon: 'phone',
      instruction: 'Check on elderly neighbors and those without AC',
      whyItMatters: 'Older adults are at highest risk for heat-related illness.',
      priority: 3,
    },
  ],
  winter: [
    {
      id: 'winter-1',
      icon: 'home',
      instruction: 'Stay indoors and limit exposure to cold',
      whyItMatters: 'Frostbite and hypothermia can occur quickly in extreme cold.',
      priority: 1,
    },
    {
      id: 'winter-2',
      icon: 'battery',
      instruction: 'Have backup heat and power sources ready',
      whyItMatters: 'Power outages during winter can make indoor temperatures dangerous.',
      priority: 2,
    },
    {
      id: 'winter-3',
      icon: 'car',
      instruction: 'Keep emergency supplies in your vehicle if you must travel',
      whyItMatters: 'If stranded in winter weather, supplies can be life-saving.',
      priority: 3,
    },
  ],
  wildfire: [
    {
      id: 'fire-1',
      icon: 'car',
      instruction: 'Be ready to evacuate immediately if ordered',
      whyItMatters: 'Wildfires can spread rapidly. Early evacuation is the safest option.',
      priority: 1,
    },
    {
      id: 'fire-2',
      icon: 'home',
      instruction: 'Close all windows and doors to prevent embers from entering',
      whyItMatters: 'Flying embers can travel miles and ignite structures.',
      priority: 2,
    },
    {
      id: 'fire-3',
      icon: 'shield',
      instruction: 'Wear a mask if air quality is poor',
      whyItMatters: 'Wildfire smoke contains fine particles that can cause respiratory problems.',
      priority: 3,
    },
  ],
  hurricane: [
    {
      id: 'hurricane-1',
      icon: 'home',
      instruction: 'Evacuate if ordered by local authorities',
      whyItMatters: 'Storm surge causes the most deaths. Evacuation orders save lives.',
      priority: 1,
    },
    {
      id: 'hurricane-2',
      icon: 'shield',
      instruction: 'If sheltering, stay in an interior room away from windows',
      whyItMatters: 'Hurricane-force winds can shatter windows and cause structural damage.',
      priority: 2,
    },
    {
      id: 'hurricane-3',
      icon: 'water',
      instruction: 'Fill bathtubs and containers with water for emergency use',
      whyItMatters: 'Water service may be disrupted during and after the storm.',
      priority: 3,
    },
  ],
  default: [
    {
      id: 'default-1',
      icon: 'radio',
      instruction: 'Monitor local news and official sources for updates',
      whyItMatters: 'Conditions can change rapidly. Staying informed helps you respond appropriately.',
      priority: 1,
    },
    {
      id: 'default-2',
      icon: 'battery',
      instruction: 'Ensure devices are charged and backup power is available',
      whyItMatters: 'Staying connected is critical during emergencies.',
      priority: 2,
    },
    {
      id: 'default-3',
      icon: 'home',
      instruction: 'Have an emergency kit ready with essentials',
      whyItMatters: 'Being prepared helps you stay safe during any emergency.',
      priority: 3,
    },
  ],
}

// Personalized action cards based on user profile
const personalizedActions: Record<string, PersonalizedAction[]> = {
  // Student-specific advice
  heat_student: [
    {
      id: 'heat-student-1',
      icon: 'water',
      instruction: 'Carry a water bottle when walking to campus',
      whyItMatters: 'Staying hydrated during your commute prevents heat exhaustion.',
      priority: 4,
      forAgeGroups: ['student'],
    },
    {
      id: 'heat-student-2',
      icon: 'home',
      instruction: 'Study in air-conditioned libraries or common areas',
      whyItMatters: 'Campus buildings often have better cooling than dorms.',
      priority: 5,
      forAgeGroups: ['student'],
    },
  ],
  winter_student: [
    {
      id: 'winter-student-1',
      icon: 'shield',
      instruction: 'Dress in layers and carry extra warm clothing for campus',
      whyItMatters: 'Walking between buildings in extreme cold requires proper protection.',
      priority: 4,
      forAgeGroups: ['student'],
    },
    {
      id: 'winter-student-2',
      icon: 'phone',
      instruction: 'Check if classes are cancelled before leaving',
      whyItMatters: 'Many schools close during severe winter weather.',
      priority: 5,
      forAgeGroups: ['student'],
    },
  ],
  
  // Senior-specific advice
  heat_senior: [
    {
      id: 'heat-senior-1',
      icon: 'firstaid',
      instruction: 'Ensure all medications are stored properly in cool conditions',
      whyItMatters: 'Heat can damage many common medications.',
      priority: 4,
      forAgeGroups: ['senior'],
    },
    {
      id: 'heat-senior-2',
      icon: 'home',
      instruction: 'Avoid going outdoors during peak heat hours (10am-4pm)',
      whyItMatters: 'Seniors are at higher risk of heat stroke and dehydration.',
      priority: 5,
      forAgeGroups: ['senior'],
    },
    {
      id: 'heat-senior-3',
      icon: 'phone',
      instruction: 'Arrange daily check-in calls with family or neighbors',
      whyItMatters: 'Heat illness can progress quickly in older adults.',
      priority: 6,
      forAgeGroups: ['senior'],
    },
  ],
  winter_senior: [
    {
      id: 'winter-senior-1',
      icon: 'firstaid',
      instruction: 'Stock at least 2 weeks of prescription medications',
      whyItMatters: 'Winter storms may prevent pharmacy trips.',
      priority: 4,
      forAgeGroups: ['senior'],
    },
    {
      id: 'winter-senior-2',
      icon: 'home',
      instruction: 'Avoid shoveling snow - arrange for help if needed',
      whyItMatters: 'Snow shoveling significantly increases heart attack risk in seniors.',
      priority: 5,
      forAgeGroups: ['senior'],
    },
  ],
  
  // Family-specific advice
  flood_family: [
    {
      id: 'flood-family-1',
      icon: 'shield',
      instruction: 'Establish a family meeting point if separated during evacuation',
      whyItMatters: 'Having a plan prevents panic and ensures everyone is accounted for.',
      priority: 4,
      forHouseholds: ['small-family', 'large-family'],
    },
    {
      id: 'flood-family-2',
      icon: 'water',
      instruction: 'Pack extra water and snacks for children in your emergency kit',
      whyItMatters: 'Children need more frequent hydration and may need comfort foods.',
      priority: 5,
      forHouseholds: ['small-family', 'large-family'],
    },
  ],
  tornado_family: [
    {
      id: 'tornado-family-1',
      icon: 'shield',
      instruction: 'Practice tornado drills with your children regularly',
      whyItMatters: 'Children who know what to do respond faster in emergencies.',
      priority: 4,
      forHouseholds: ['small-family', 'large-family'],
    },
    {
      id: 'tornado-family-2',
      icon: 'home',
      instruction: 'Designate a safe room and keep comfort items there for kids',
      whyItMatters: 'Familiar items help children stay calm during scary situations.',
      priority: 5,
      forHouseholds: ['small-family', 'large-family'],
    },
  ],
  
  // Medical needs
  all_medical: [
    {
      id: 'medical-1',
      icon: 'firstaid',
      instruction: 'Keep a 2-week supply of all prescription medications ready',
      whyItMatters: 'Pharmacies may be closed during emergencies.',
      priority: 4,
      forConditions: ['medical-needs'],
    },
    {
      id: 'medical-2',
      icon: 'battery',
      instruction: 'Have backup power for medical devices',
      whyItMatters: 'Power outages can be life-threatening if you depend on medical equipment.',
      priority: 5,
      forConditions: ['medical-needs'],
    },
  ],
  
  // Mobility issues
  all_mobility: [
    {
      id: 'mobility-1',
      icon: 'phone',
      instruction: 'Register with your local emergency services for evacuation assistance',
      whyItMatters: 'First responders can prioritize those who need help evacuating.',
      priority: 4,
      forConditions: ['mobility-issues'],
    },
    {
      id: 'mobility-2',
      icon: 'home',
      instruction: 'Keep mobility aids and essentials on the ground floor',
      whyItMatters: 'Quick access to aids is critical during emergencies.',
      priority: 5,
      forConditions: ['mobility-issues'],
    },
  ],
  
  // Pets
  all_pets: [
    {
      id: 'pets-1',
      icon: 'shield',
      instruction: 'Prepare a pet emergency kit with food, water, and medications',
      whyItMatters: 'Pets need emergency supplies just like humans.',
      priority: 4,
      forConditions: ['pets'],
    },
    {
      id: 'pets-2',
      icon: 'car',
      instruction: 'Know pet-friendly evacuation shelters in your area',
      whyItMatters: 'Not all shelters accept pets - plan ahead.',
      priority: 5,
      forConditions: ['pets'],
    },
  ],
  flood_pets: [
    {
      id: 'flood-pets-1',
      icon: 'car',
      instruction: 'Never leave pets behind during flood evacuations',
      whyItMatters: 'Floodwaters rise quickly and pets cannot escape on their own.',
      priority: 6,
      forConditions: ['pets'],
    },
  ],
  
  // Young children
  all_children: [
    {
      id: 'children-1',
      icon: 'shield',
      instruction: 'Pack comfort items like toys and blankets in emergency kit',
      whyItMatters: 'Familiar items help young children cope with stressful situations.',
      priority: 4,
      forConditions: ['young-children'],
    },
    {
      id: 'children-2',
      icon: 'water',
      instruction: 'Stock extra formula, diapers, and baby food',
      whyItMatters: 'Stores may be closed during emergencies.',
      priority: 5,
      forConditions: ['young-children'],
    },
  ],
  heat_children: [
    {
      id: 'heat-children-1',
      icon: 'car',
      instruction: 'Never leave children in parked vehicles - even for a minute',
      whyItMatters: 'Car interiors can reach deadly temperatures in minutes.',
      priority: 6,
      forConditions: ['young-children'],
    },
  ],
}

function getPersonalizedActions(
  alertType: string,
  ageGroup?: string | null,
  householdType?: string | null,
  conditions?: string[]
): PersonalizedAction[] {
  const personalActions: PersonalizedAction[] = []
  
  // Add age-specific actions
  if (ageGroup) {
    const ageKey = `${alertType}_${ageGroup}`
    if (personalizedActions[ageKey]) {
      personalActions.push(...personalizedActions[ageKey])
    }
  }
  
  // Add household-specific actions
  if (householdType && ['small-family', 'large-family'].includes(householdType)) {
    const familyKey = `${alertType}_family`
    if (personalizedActions[familyKey]) {
      personalActions.push(...personalizedActions[familyKey])
    }
  }
  
  // Add condition-specific actions
  if (conditions && conditions.length > 0) {
    // Alert-specific conditions
    conditions.forEach((condition) => {
      const conditionKey = `${alertType}_${condition.replace('-', '_')}`
      if (personalizedActions[conditionKey]) {
        personalActions.push(...personalizedActions[conditionKey])
      }
      
      // General condition advice (applies to all alerts)
      const generalKey = `all_${condition.replace('-', '_')}`
      if (personalizedActions[generalKey]) {
        personalActions.push(...personalizedActions[generalKey])
      }
    })
  }
  
  return personalActions
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const alertType = searchParams.get('type') as AlertType | null
  const ageGroup = searchParams.get('ageGroup')
  const householdType = searchParams.get('householdType')
  const conditions = searchParams.get('conditions')?.split(',').filter(Boolean) || []

  // Get base actions for the alert type
  const baseActions = baseActionsByType[alertType || ''] || baseActionsByType.default

  // Get personalized actions
  const personalActions = getPersonalizedActions(
    alertType || 'default',
    ageGroup,
    householdType,
    conditions
  )

  // Combine and sort by priority
  const allActions = [...baseActions, ...personalActions]
    .sort((a, b) => a.priority - b.priority)

  // Add alertId to each action
  const actions: ActionCard[] = allActions.map((action) => ({
    id: action.id,
    alertId: searchParams.get('alertId') || 'unknown',
    icon: action.icon,
    instruction: action.instruction,
    whyItMatters: action.whyItMatters,
    priority: action.priority,
  }))

  return NextResponse.json(actions)
}
