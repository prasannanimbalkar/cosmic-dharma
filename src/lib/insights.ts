import type { BirthChart, PlanetPosition } from './astrology'
import { houseForSign } from './astrology'
import type { PlanetName } from './constants'
import { planetDignity } from './dignity'

export interface InsightBlock {
  title: string
  text: string
}

export interface InsightSection {
  title: string
  paragraphs: string[]
}

export interface ChartInsights {
  tagline: string
  chartLegend: { symbol: string; meaning: string }[]
  guideCards: InsightBlock[]
  highlightCards: InsightBlock[]
  planetCards: InsightBlock[]
  howToRead: InsightSection
  yourStory: InsightSection
  planetaryStory: InsightSection
}

/** Short reference cards — quick scan before the detailed paragraphs */
export const CHART_READING_GUIDE: InsightBlock[] = [
  {
    title: 'What is this chart?',
    text: 'Your Kundali is a snapshot of the sky at birth, using the Vedic (sidereal) zodiac. Think of it as a map of tendencies—not a fixed fate. It highlights where your energy naturally flows and where life asks you to grow.',
  },
  {
    title: 'Lagna (Ascendant)',
    text: 'The sign rising on the eastern horizon when you were born is your Lagna. It colors your body, first impressions, and the lens through which you meet life. In the diamond chart, planets in your Lagna sign appear with “La”.',
  },
  {
    title: 'The twelve houses',
    text: 'Each box is a “house”—a life area. House 1 starts at your Lagna sign and the rest follow in order around the chart. Planets in a house show where your attention and experiences tend to gather.',
  },
  {
    title: 'Planets (Grahas)',
    text: 'Planets are symbols for different energies: Sun (identity), Moon (mind), Mars (action), Mercury (thought), Jupiter (growth), Venus (love), Saturn (lessons), Rahu (desire for more), Ketu (letting go). Sign = style; house = life topic.',
  },
  {
    title: 'Nakshatra & Pada',
    text: 'The Moon’s Nakshatra (lunar mansion) fine-tunes your emotional nature and sets the Vimshottari Dasha timeline. Pada is a quarter within that star—useful detail, but the Nakshatra name is the main story for beginners.',
  },
  {
    title: 'Chart tabs',
    text: 'Lagna is your main birth chart. Navamsha (D9) is often read for marriage and inner strength. Moon chart rotates the wheel so the Moon’s sign becomes the reference—helpful for mind and feelings.',
  },
  {
    title: 'Symbols on the chart',
    text: 'Two-digit numbers are degrees within the sign. * means retrograde (energy turned inward or reviewed). ↑ exalted, ↓ debilitated—strength or challenge in expressing that planet’s themes.',
  },
]

const PLANET_ROLES: Record<PlanetName, { role: string; helps: string }> = {
  Sun: {
    role: 'your core identity and confidence',
    helps: 'shows where you seek recognition and grow into your true self',
  },
  Moon: {
    role: 'your mind, moods, and comfort needs',
    helps: 'shows what makes you feel safe and how you react emotionally',
  },
  Mars: {
    role: 'your drive, courage, and energy',
    helps: 'shows where you take action, compete, or need to channel anger wisely',
  },
  Mercury: {
    role: 'thinking, speech, and learning',
    helps: 'shows how you analyze problems and communicate ideas',
  },
  Jupiter: {
    role: 'wisdom, teachers, and expansion',
    helps: 'shows where life feels generous and where you can grow through faith or study',
  },
  Venus: {
    role: 'love, beauty, and pleasure',
    helps: 'shows what you enjoy, how you relate in love, and your sense of harmony',
  },
  Saturn: {
    role: 'discipline, patience, and life lessons',
    helps: 'shows where hard work pays off slowly and maturity is required',
  },
  Rahu: {
    role: 'ambition and new experiences',
    helps: 'shows where you crave more, take risks, or feel pulled toward the unfamiliar',
  },
  Ketu: {
    role: 'detachment and inner knowing',
    helps: 'shows where you may let go, feel less attached, or develop spiritual insight',
  },
}

const DASHA_CARD_THEMES: Record<PlanetName, string> = {
  Sun: 'a chapter about confidence, visibility, and stepping into leadership—even if it means facing ego lessons.',
  Moon: 'a chapter about emotions, family, home, and mental peace. Life may revolve around comfort and belonging.',
  Mars: 'a chapter about action, courage, property, or conflict. Energy is high; channel it into healthy goals.',
  Mercury: 'a chapter about study, business, communication, and skill-building. Ideas and networking matter more.',
  Jupiter: 'a chapter about growth, teachers, children, or faith. Opportunities often come through wisdom and patience.',
  Venus: 'a chapter about love, marriage, art, luxury, and harmony. Relationships and enjoyment take center stage.',
  Saturn: 'a chapter about responsibility, delays, and long-term structure. Hard work and boundaries define success.',
  Rahu: 'a chapter about ambition, change, and worldly hunger. Unusual paths or foreign influences may appear.',
  Ketu: 'a chapter about simplification, spirituality, and release. You may care less about old goals and more about meaning.',
}

const HOUSE_TOPICS: Record<number, { name: string; plain: string }> = {
  1: { name: 'self and vitality', plain: 'how you come across, your body, and your overall direction in life' },
  2: { name: 'wealth and voice', plain: 'money, family values, speech, and what you value' },
  3: { name: 'courage and skills', plain: 'siblings, hobbies, short journeys, and everyday boldness' },
  4: { name: 'home and peace', plain: 'mother, property, inner comfort, and emotional roots' },
  5: { name: 'creativity and joy', plain: 'children, romance, hobbies, and what makes you feel alive' },
  6: { name: 'work and health', plain: 'daily routines, service, rivals, and staying well' },
  7: { name: 'partnerships', plain: 'marriage, business partners, and one-to-one relationships' },
  8: { name: 'change and depth', plain: "shared resources, transformation, and life's deeper turns" },
  9: { name: 'luck and beliefs', plain: 'teachers, travel, faith, and your worldview' },
  10: { name: 'career and reputation', plain: 'work, status, authority, and how the public sees you' },
  11: { name: 'gains and friends', plain: 'income, networks, hopes, and community support' },
  12: { name: 'rest and letting go', plain: 'sleep, spirituality, foreign lands, and quiet withdrawal' },
}

const SIGN_TRAITS: Record<string, string> = {
  Aries: 'direct, energetic, and quick to start things—you often lead with action rather than long planning',
  Taurus: 'steady, grounded, and focused on comfort and security—you build slowly but tend to last',
  Gemini: 'curious, talkative, and mentally quick—you learn by asking questions and trying many interests',
  Cancer: 'nurturing, protective, and emotionally aware—you care deeply about home, family, and belonging',
  Leo: 'warm, proud, and creative—you like to be seen and to express yourself with heart',
  Virgo: 'practical, thoughtful, and improvement-minded—you notice details others miss and like to be useful',
  Libra: 'diplomatic, fair, and relationship-oriented—you seek balance and harmony in people situations',
  Scorpio: 'intense, private, and deep—you feel life strongly and prefer honesty over small talk',
  Sagittarius: 'optimistic, freedom-loving, and philosophical—you need space to grow and explore ideas',
  Capricorn: 'ambitious, disciplined, and patient—you respect structure and long-term goals',
  Aquarius: 'independent, idealistic, and forward-thinking—you care about people but need your own path',
  Pisces: 'imaginative, kind, and spiritually open—you feel the mood of a room and absorb emotions easily',
}

const PLANET_INTRO: Record<PlanetName, string> = {
  Sun: 'The Sun is your sense of “I am”—confidence, purpose, and the fatherly or authority energy in life.',
  Moon: 'The Moon is your mind and heart—habits, moods, motherly themes, and what helps you feel safe.',
  Mars: 'Mars is your drive—courage, competition, anger when blocked, and the push to act.',
  Mercury: 'Mercury is how you think and speak—learning, business sense, humor, and nervous energy.',
  Jupiter: 'Jupiter is growth—teachers, wisdom, children, luck, and faith that life can expand.',
  Venus: 'Venus is love and pleasure—beauty, romance, art, comfort, and how you attract harmony.',
  Saturn: 'Saturn is the strict teacher—discipline, delay, responsibility, and lessons that mature you over time.',
  Rahu: 'Rahu is hunger for more—ambition, obsession, foreign or unusual experiences, and breaking old limits.',
  Ketu: 'Ketu is release—detachment, intuition, past-life patterns, and turning away from what no longer fits.',
}

const DASHA_THEMES: Record<PlanetName, string> = {
  Sun: 'confidence, visibility, leadership, and questions around ego and self-respect',
  Moon: 'emotions, family, home, mental peace, and the need to feel nurtured',
  Mars: 'action, property, courage, conflict, or sports-like energy that must be channeled wisely',
  Mercury: 'study, business, communication, skills, and networking',
  Jupiter: 'growth, teachers, children, faith, and opportunities that reward patience',
  Venus: 'love, marriage, art, luxury, pleasure, and social harmony',
  Saturn: 'hard work, responsibility, delays, boundaries, and building something that lasts',
  Rahu: 'ambition, change, worldly desire, and paths that feel unfamiliar or unconventional',
  Ketu: 'simplification, spirituality, letting go, and less interest in old material goals',
}

const NAKSHATRA_HINTS: Record<string, string> = {
  Ashwini: 'a quick, healing, and pioneering emotional style',
  Bharani: 'emotions tied to transformation, duty, and carrying weight for others',
  Krittika: 'a sharp, purifying feeling nature that cuts through confusion',
  Rohini: 'a love of beauty, growth, comfort, and steady emotional nourishment',
  Mrigashira: 'a searching, gentle curiosity in the mind',
  Ardra: 'intense feelings that storm and then clear the air for renewal',
  Punarvasu: 'hope, second chances, and returning to what matters',
  Pushya: 'nurturing, supportive, and protective emotional energy',
  Ashlesha: 'deep intuition, intensity, and strong bonds',
  Magha: 'pride, ancestry, legacy, and respect for tradition',
  'Purva Phalguni': 'romance, relaxation, creativity, and enjoyment of life',
  'Uttara Phalguni': 'commitment, contracts, and reliable partnership',
  Hasta: 'clever hands, skill, and practical intelligence',
  Chitra: 'style, design, and a striking personal presence',
  Swati: 'independence, flexibility, and moving with the wind',
  Vishakha: 'determination, celebration, and goal-focused feelings',
  Anuradha: 'loyalty, friendship, and devotional depth',
  Jyeshtha: 'intensity, protection, and senior or responsible roles',
  Mula: 'getting to the root, uprooting, and starting fresh',
  'Purva Ashadha': 'fresh faith, conviction, and invincible optimism',
  'Uttara Ashadha': 'lasting success through patience and integrity',
  Shravana: 'listening, learning, and sacred or thoughtful speech',
  Dhanishtha: 'rhythm, wealth themes, and success in groups',
  Shatabhisha: 'healing, secrets, and unconventional paths',
  'Purva Bhadrapada': 'idealism, fire, and spiritual intensity',
  'Uttara Bhadrapada': 'compassion, surrender, and deep empathy',
  Revati: 'completion, travel, guidance, and gentle endings',
}

function planetHouse(chart: BirthChart, planet: PlanetPosition): number {
  return houseForSign(chart.lagnaRashi, planet.rashi)
}

function getMoon(chart: BirthChart): PlanetPosition {
  return chart.planets.find((p) => p.name === 'Moon')!
}

function getSun(chart: BirthChart): PlanetPosition {
  return chart.planets.find((p) => p.name === 'Sun')!
}

function currentDasha(chart: BirthChart) {
  const now = new Date()
  return chart.vimshottari.find((d) => now >= d.start && now < d.end)
}

function dignitySentence(planet: PlanetName, rashi: number): string {
  const d = planetDignity(planet, rashi)
  if (d === 'exalted') {
    return `In ${planet}'s chart position it is considered strong (exalted ↑), so its gifts may show up more easily—though even a strong planet needs balance and humility.`
  }
  if (d === 'debilitated') {
    return `Here ${planet} is in a challenging placement (debilitated ↓), which does not mean failure—it often means you learn this planet's lessons through experience, patience, and repeated practice until they become real wisdom.`
  }
  return `This is a mixed or neutral strength for ${planet}, so results depend more on your choices, other planets, and the dasha period you are running.`
}

function dignityNoteShort(planet: PlanetName, rashi: number): string {
  const d = planetDignity(planet, rashi)
  if (d === 'exalted') {
    return `${planet} is strong in this sign (↑)—its themes may come more naturally, though balance still matters.`
  }
  if (d === 'debilitated') {
    return `${planet} works harder here (↓)—you may need extra patience and practice in this area, which can still build depth.`
  }
  return ''
}

function buildHighlightCards(chart: BirthChart): InsightBlock[] {
  const moon = getMoon(chart)
  const sun = getSun(chart)
  const dasha = currentDasha(chart)
  const lagnaTrait =
    SIGN_TRAITS[chart.lagnaName]?.split('—')[0] ?? 'unique in expression'
  const moonTrait = SIGN_TRAITS[moon.rashiName]?.split('—')[0] ?? 'emotionally complex'
  const sunTrait = SIGN_TRAITS[sun.rashiName]?.split('—')[0] ?? 'purposeful'
  const nakHint = NAKSHATRA_HINTS[moon.nakshatraName] ?? 'a distinctive emotional rhythm'

  const cards: InsightBlock[] = [
    {
      title: `You meet the world as ${chart.lagnaName} rising`,
      text: `Your Lagna is ${chart.lagnaName}. In everyday terms, people often see you as ${lagnaTrait}. This is the “wrapper” around your personality—how you start projects and show up when meeting someone new.`,
    },
    {
      title: `Your emotional core is ${moon.rashiName} Moon`,
      text: `The Moon in ${moon.rashiName} (${moon.nakshatraName} Nakshatra) shapes your inner world. You tend to feel and react in ways that are ${moonTrait}. Nakshatra flavor: ${nakHint}.`,
    },
    {
      title: `Your sense of purpose shines through ${sun.rashiName}`,
      text: `The Sun in ${sun.rashiName} points to where you seek respect and clarity about “who I am.” You express purpose in a way that is ${sunTrait}.`,
    },
  ]

  if (dasha) {
    cards.push({
      title: `Life chapter now: ${dasha.lord} period`,
      text: `You are in a ${dasha.lord} Mahadasha (major planetary period). ${DASHA_CARD_THEMES[dasha.lord]} This does not override your whole chart—it is the main background theme for this stretch of years.`,
    })
  }

  return cards
}

function buildPlanetCards(chart: BirthChart): InsightBlock[] {
  const cards: InsightBlock[] = [
    {
      title: `Ascendant in ${chart.lagnaName} · House 1`,
      text: `Your rising sign sets House 1—the house of self. Being ${chart.lagnaName} rising, vitality and identity themes are colored by traits that are ${SIGN_TRAITS[chart.lagnaName]?.split('—')[0] ?? 'distinctive'}. Planets here strongly shape how others experience you.`,
    },
  ]

  for (const p of chart.planets) {
    const house = planetHouse(chart, p)
    const topic = HOUSE_TOPICS[house]
    const role = PLANET_ROLES[p.name]
    const dignity = dignityNoteShort(p.name, p.rashi)
    const retro = p.retrograde
      ? ' Retrograde (*) suggests you process this energy inwardly or revisit the same lessons until they stick.'
      : ''

    cards.push({
      title: `${p.name} in ${p.rashiName} · House ${house} (${topic.name})`,
      text: `${p.name} rules ${role.role}. In your chart it sits in the ${house}th house, linked to ${topic.plain}. ${role.helps}.${retro}${dignity ? ` ${dignity}` : ''}`,
    })
  }

  return cards
}

function retrogradeSentence(planet: PlanetName, retro: boolean): string {
  if (!retro) return ''
  return ` ${planet} is retrograde (*) at birth, which in simple terms can turn its energy inward: you may rethink the same themes, feel delays, or master this area through reflection rather than outward rush.`
}

function buildHowToReadParagraphs(): string[] {
  return [
    `Your Kundali (birth chart) is a picture of the sky at the exact time and place you were born, drawn in the Vedic or sidereal zodiac. It is not a verdict on your future; it is more like a personal map of tendencies—where your energy flows easily, where life asks you to grow, and which themes repeat in relationships, work, and inner life. Many people use it for self-understanding rather than superstition.`,
    `The diamond chart you see is a North Indian style layout. The sign that was rising in the east when you were born is your Lagna (Ascendant)—think of it as the front door of your personality. From that sign, the twelve houses are counted in order: each house is a life topic (self, money, home, marriage, career, and so on). Planets sitting in a house show where your attention and life events often gather. The small numbers are degrees within a sign; abbreviations like Mo or Su are planets; * means retrograde; ↑ and ↓ hint at very strong or challenging placements.`,
    `Below the main chart you will also see Navagraha tables (exact positions), Nakshatra (lunar mansion), and Vimshottari Dasha (planetary time periods). The Moon's Nakshatra sets your dasha timeline—long chapters of life ruled by one planet at a time. The Lagna tab is your main chart; Navamsha (D9) is often read for marriage and inner strength; the Moon chart rotates the wheel to highlight mind and feelings. Read the sections below as a story about you, not as fixed fate.`,
  ]
}

function buildYourStoryParagraphs(chart: BirthChart): string[] {
  const moon = getMoon(chart)
  const sun = getSun(chart)
  const dasha = currentDasha(chart)
  const lagnaTrait = SIGN_TRAITS[chart.lagnaName] ?? 'distinctive and memorable in your own way'
  const moonTrait = SIGN_TRAITS[moon.rashiName] ?? 'rich and changeable on the inside'
  const sunTrait = SIGN_TRAITS[sun.rashiName] ?? 'focused on purpose and dignity'
  const nakHint = NAKSHATRA_HINTS[moon.nakshatraName] ?? 'a unique emotional rhythm'

  const paragraphs: string[] = [
    `${chart.name}, when you were born the sign ${chart.lagnaName} was rising on the eastern horizon. That rising sign—your Lagna—is one of the most personal points in Vedic astrology because it describes how you meet the world, your body language, first impressions, and the general “tone” of your life path. With ${chart.lagnaName} rising, people often experience you as someone who is ${lagnaTrait}. This does not mean you are only that sign; it means this energy is the lens through which much of your life unfolds.`,
    `Inside that outer style, your Moon in ${moon.rashiName} describes your mind, moods, and what you need to feel emotionally safe. The Moon is especially important in Jyotish because the mind shapes how you experience every other planet. Your Moon sits in the ${moon.nakshatraName} Nakshatra, which adds ${nakHint}. In daily life this often shows up as reactions and habits that are ${moonTrait}. When you understand your Moon, you understand why certain environments comfort you and others drain you.`,
    `Your Sun in ${sun.rashiName} speaks to confidence, purpose, and the part of you that wants respect and clarity about who you are. The Sun is ${sunTrait} in this sign. Where the Moon is “how I feel,” the Sun is closer to “what I stand for.” Together, your ${chart.lagnaName} rising, ${moon.rashiName} Moon, and ${sun.rashiName} Sun form a three-layer picture: how you appear, how you feel inside, and what you are growing into.`,
  ]

  if (dasha) {
    const start = dasha.start.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    const end = dasha.end.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    paragraphs.push(
      `Right now you are in a major life chapter called the ${dasha.lord} Mahadasha (from about ${start} to ${end}). A dasha is like the background music of a period of years: it does not erase the rest of your chart, but it highlights themes such as ${DASHA_THEMES[dasha.lord]}. During this time, events linked to ${dasha.lord}—and to the houses where ${dasha.lord} sits in your chart—often feel louder or more urgent. Knowing this helps you work with the period instead of fighting it blindly.`,
    )
  }

  return paragraphs
}

function buildPlanetParagraph(chart: BirthChart, p: PlanetPosition): string {
  const house = planetHouse(chart, p)
  const topic = HOUSE_TOPICS[house]
  const intro = PLANET_INTRO[p.name]
  const dignity = dignitySentence(p.name, p.rashi)
  const retro = retrogradeSentence(p.name, p.retrograde)

  return `${intro} In your chart, ${p.name} is placed in ${p.rashiName} and falls in the ${house}th house—the area of life connected to ${topic.name}, which includes ${topic.plain}. So the style of ${p.name} (how it acts) comes from ${p.rashiName}, while the stage (where life puts it) is the ${house}th house. Practically, you may notice ${p.name}'s themes showing up whenever you deal with ${topic.plain}.${retro} ${dignity}`
}

function buildPlanetaryStoryParagraphs(chart: BirthChart): string[] {
  const intro = `The nine grahas (planets) are like nine teachers in your chart. Each one rules a different part of human experience. Below is a plain-language walkthrough of where each planet sits in your Kundali and how that can help you in everyday life. Remember: a chart shows tendencies and timing, not a script you cannot change.`

  const ascParagraph = `Your Ascendant (Lagna) in ${chart.lagnaName} always rules the 1st house of self, body, and identity. ${SIGN_TRAITS[chart.lagnaName] ? `Being ${chart.lagnaName} rising, vitality and life direction are colored by qualities that are ${SIGN_TRAITS[chart.lagnaName]}.` : ''} Any planet placed in your 1st house (same sign as the rising sign) strongly shapes how others see you and how you see yourself.`

  const planetParagraphs = chart.planets.map((p) => buildPlanetParagraph(chart, p))

  return [intro, ascParagraph, ...planetParagraphs]
}

export function buildChartInsights(chart: BirthChart): ChartInsights {
  return {
    tagline: `Readings for ${chart.name} in everyday language—quick highlights below, then full paragraphs for a deeper walkthrough.`,
    chartLegend: [
      { symbol: 'La', meaning: 'Ascendant (Lagna)—your rising sign degree' },
      { symbol: 'Su, Mo, Ma…', meaning: 'Sun, Moon, Mars, and other planets' },
      { symbol: '*', meaning: 'Retrograde—energy turned inward or reviewed' },
      { symbol: '↑ ↓', meaning: 'Strong (exalted) or challenging (debilitated) placement' },
      { symbol: '1–12', meaning: 'Sign numbers: 1 = Aries through 12 = Pisces' },
    ],
    guideCards: CHART_READING_GUIDE,
    highlightCards: buildHighlightCards(chart),
    planetCards: buildPlanetCards(chart),
    howToRead: {
      title: 'How to understand this chart',
      paragraphs: buildHowToReadParagraphs(),
    },
    yourStory: {
      title: 'Your chart in plain English',
      paragraphs: buildYourStoryParagraphs(chart),
    },
    planetaryStory: {
      title: 'How each planet helps or challenges you',
      paragraphs: buildPlanetaryStoryParagraphs(chart),
    },
  }
}
