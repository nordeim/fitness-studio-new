/**
 * Idempotent seed: instructors, memberships, and a full weekly schedule.
 * Natural-key upserts keyed on stable slug/id fields — safe to re-run.
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const INSTRUCTORS = [
  {
    id: 'instr-keyla',
    name: 'Keyla Lie',
    title: 'YOGA & MINDFULNESS',
    bio: 'Strength begins in stillness.',
    philosophy:
      'A decade of practice across Bali and Mysore taught Keyla that breath is the first strength. Her classes move slow, land deep, and leave you taller.',
    imageUrl: '/images/coach-keyla.jpg',
    specialties: JSON.stringify(['Vinyasa Flow', 'Yin Yoga', 'Breathwork', 'Meditation']),
    certifications: JSON.stringify(['RYT-500', 'Yin Yoga Certified', 'Breathwork Facilitator']),
    sortOrder: 1,
  },
  {
    id: 'instr-aria',
    name: 'Aria Rodriguez',
    title: 'HIIT & STRENGTH',
    bio: 'Your limits are just suggestions.',
    philosophy:
      'Former track athlete turned strength coach, Aria builds sessions that torch expectations and calories in equal measure.',
    imageUrl: '/images/coach-aria.jpg',
    specialties: JSON.stringify(['HIIT', 'Kettlebells', 'Olympic Lifts', 'Conditioning']),
    certifications: JSON.stringify(['NASM-CPT', 'CSCS', 'Precision Nutrition L1']),
    sortOrder: 2,
  },
  {
    id: 'instr-sienna',
    name: 'Sienna Brooks',
    title: 'PILATES & BARRE',
    bio: 'Precision is the ultimate power.',
    philosophy:
      'Sienna spent eight years with professional ballet companies before falling for the reformer. Expect burnouts disguised as elegance.',
    imageUrl: '/images/coach-sienna.jpg',
    specialties: JSON.stringify(['Reformer Pilates', 'Classical Barre', 'Mobility', 'Postnatal']),
    certifications: JSON.stringify(['STOTT Pilates', 'Barre Certified', 'Pre/Postnatal Specialist']),
    sortOrder: 3,
  },
  {
    id: 'instr-jordan',
    name: 'Jordan Lewis',
    title: 'STRENGTH & CONDITIONING',
    bio: 'Build the body, train the mind.',
    philosophy:
      'Powerlifter, coach, and psychology nerd. Jordan programs strength like chess — three moves ahead of the burn.',
    imageUrl: '/images/coach-jordan.jpg',
    specialties: JSON.stringify(['Powerlifting', 'Functional Strength', 'Sled Work', 'Recovery']),
    certifications: JSON.stringify(['NSCA-CSCS', 'USAW L2', 'FMS L2']),
    sortOrder: 4,
  },
]

const MEMBERSHIPS = [
  {
    id: 'mem-unlimited',
    name: 'Unlimited',
    priceCents: 14900,
    billingCycle: 'MONTHLY',
    classesPerMonth: null,
    features: JSON.stringify([
      'Unlimited classes, all disciplines',
      'Priority booking 7 days ahead',
      'Guest pass every month',
      'Nutrition starter guide',
    ]),
    isFeatured: true,
    sortOrder: 1,
  },
  {
    id: 'mem-8x',
    name: '8 Classes / Month',
    priceCents: 9900,
    billingCycle: 'MONTHLY',
    classesPerMonth: 8,
    features: JSON.stringify([
      '8 classes per month',
      'Any discipline, any time',
      'Rolls over up to 2 classes',
      'Member community access',
    ]),
    isFeatured: false,
    sortOrder: 2,
  },
  {
    id: 'mem-offpeak',
    name: 'Off-Peak',
    priceCents: 7900,
    billingCycle: 'MONTHLY',
    classesPerMonth: null,
    features: JSON.stringify([
      'Unlimited weekday classes before 4 PM',
      'Any discipline',
      'Member community access',
      'Freeze up to 60 days a year',
    ]),
    isFeatured: false,
    sortOrder: 3,
  },
]

interface SeedClass {
  title: string
  type: string
  intensity: string
  dayOfWeek: string
  startTime: string
  endTime: string
  capacity: number
  spotsTaken: number
  description: string
  instructorName: string
  requirements?: string
}

const SCHEDULE: SeedClass[] = [
  // Monday
  { title: 'Sunrise Flow', type: 'YOGA', intensity: 'LOW', dayOfWeek: 'MONDAY', startTime: '06:30', endTime: '07:30', capacity: 16, spotsTaken: 9, description: 'Wake the spine, open the lungs, set the tone.', instructorName: 'Keyla Lie', requirements: 'Mat provided. Arrive 10 minutes early.' },
  { title: 'Power HIIT', type: 'HIIT', intensity: 'HIGH', dayOfWeek: 'MONDAY', startTime: '07:00', endTime: '08:00', capacity: 16, spotsTaken: 14, description: '40 seconds on, 20 off. Zero mercy, all heart.', instructorName: 'Aria Rodriguez', requirements: 'Towel and water bottle.' },
  { title: 'Reformer Foundations', type: 'PILATES', intensity: 'LOW', dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:00', capacity: 12, spotsTaken: 6, description: 'Machine Pilates for beginners — control before speed.', instructorName: 'Sienna Brooks' },
  { title: 'Total Body Strength', type: 'STRENGTH', intensity: 'MEDIUM', dayOfWeek: 'MONDAY', startTime: '18:00', endTime: '19:00', capacity: 16, spotsTaken: 12, description: 'Squat, hinge, press, pull — the full template.', instructorName: 'Jordan Lewis', requirements: 'Lifting shoes recommended.' },
  { title: 'Barre Sculpt', type: 'BARRE', intensity: 'MEDIUM', dayOfWeek: 'MONDAY', startTime: '19:15', endTime: '20:15', capacity: 16, spotsTaken: 8, description: 'Micro-movements, major burn.', instructorName: 'Sienna Brooks' },

  // Tuesday
  { title: 'Vinyasa Level 2', type: 'YOGA', intensity: 'MEDIUM', dayOfWeek: 'TUESDAY', startTime: '07:00', endTime: '08:15', capacity: 16, spotsTaken: 11, description: 'Breath-linked flow with arm balances and inversions.', instructorName: 'Keyla Lie' },
  { title: 'Tabata Express', type: 'HIIT', intensity: 'HIGH', dayOfWeek: 'TUESDAY', startTime: '12:15', endTime: '12:45', capacity: 20, spotsTaken: 15, description: 'Lunch-break blitz — in, out, done in 30.', instructorName: 'Aria Rodriguez' },
  { title: 'Pilates Core Lab', type: 'PILATES', intensity: 'MEDIUM', dayOfWeek: 'TUESDAY', startTime: '18:00', endTime: '19:00', capacity: 14, spotsTaken: 10, description: 'Deep-core work on the reformer and mat.', instructorName: 'Sienna Brooks' },
  { title: 'Ride & Rhythm', type: 'CYCLING', intensity: 'HIGH', dayOfWeek: 'TUESDAY', startTime: '19:30', endTime: '20:30', capacity: 24, spotsTaken: 19, description: 'Beat-driven indoor cycling. Clip in, zone out.', instructorName: 'Aria Rodriguez', requirements: 'Cycling shoes with SPD cleats (rentals available).' },

  // Wednesday
  { title: 'Yin & Sound Bath', type: 'YOGA', intensity: 'LOW', dayOfWeek: 'WEDNESDAY', startTime: '06:30', endTime: '07:45', capacity: 16, spotsTaken: 13, description: 'Long-held stretches with live sound healing.', instructorName: 'Keyla Lie' },
  { title: 'Kettlebell conditioning', type: 'STRENGTH', intensity: 'HIGH', dayOfWeek: 'WEDNESDAY', startTime: '07:00', endTime: '08:00', capacity: 16, spotsTaken: 7, description: 'Swing, clean, snatch — the bell is the teacher.', instructorName: 'Jordan Lewis', requirements: 'Grip strength helps. Chalk provided.' },
  { title: 'Barre Burn', type: 'BARRE', intensity: 'HIGH', dayOfWeek: 'WEDNESDAY', startTime: '18:00', endTime: '19:00', capacity: 16, spotsTaken: 11, description: 'Classic barre, turned all the way up.', instructorName: 'Sienna Brooks' },
  { title: 'Evening Flow', type: 'YOGA', intensity: 'LOW', dayOfWeek: 'WEDNESDAY', startTime: '20:00', endTime: '21:00', capacity: 16, spotsTaken: 5, description: 'Unwind the day. Candlelight, slow sequence.', instructorName: 'Keyla Lie' },

  // Thursday
  { title: 'HIIT 45', type: 'HIIT', intensity: 'HIGH', dayOfWeek: 'THURSDAY', startTime: '06:30', endTime: '07:15', capacity: 20, spotsTaken: 16, description: '45 minutes of engineered suffering.', instructorName: 'Aria Rodriguez' },
  { title: 'Reformer Flow', type: 'PILATES', intensity: 'MEDIUM', dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '10:00', capacity: 12, spotsTaken: 12, description: 'Intermediate reformer choreography at tempo.', instructorName: 'Sienna Brooks' },
  { title: 'Deadlift Day', type: 'STRENGTH', intensity: 'MEDIUM', dayOfWeek: 'THURSDAY', startTime: '17:30', endTime: '18:30', capacity: 14, spotsTaken: 6, description: 'Pull heavy, brace hard, walk taller.', instructorName: 'Jordan Lewis', requirements: 'Flat-soled shoes.' },
  { title: 'Restore & Stretch', type: 'YOGA', intensity: 'LOW', dayOfWeek: 'THURSDAY', startTime: '19:30', endTime: '20:30', capacity: 16, spotsTaken: 4, description: 'Recovery-first: fascia release and mobility.', instructorName: 'Keyla Lie' },

  // Friday
  { title: 'Flow & Fire', type: 'YOGA', intensity: 'MEDIUM', dayOfWeek: 'FRIDAY', startTime: '07:00', endTime: '08:00', capacity: 16, spotsTaken: 10, description: 'Power yoga meets cardio bursts.', instructorName: 'Keyla Lie' },
  { title: 'Friday Fight Club', type: 'HIIT', intensity: 'HIGH', dayOfWeek: 'FRIDAY', startTime: '17:30', endTime: '18:30', capacity: 20, spotsTaken: 18, description: 'End the week with a bang. Boxing-infused HIIT.', instructorName: 'Aria Rodriguez', requirements: 'Hand wraps (sold at front desk).' },
  { title: 'Hills & Sprints', type: 'CYCLING', intensity: 'HIGH', dayOfWeek: 'FRIDAY', startTime: '18:45', endTime: '19:45', capacity: 24, spotsTaken: 9, description: 'Climbs that build legs, sprints that empty them.', instructorName: 'Aria Rodriguez' },

  // Saturday
  { title: 'Saturday Sweat', type: 'HIIT', intensity: 'HIGH', dayOfWeek: 'SATURDAY', startTime: '08:00', endTime: '09:00', capacity: 24, spotsTaken: 21, description: 'The weekend flagship. Bring a friend, lose your voice.', instructorName: 'Aria Rodriguez' },
  { title: 'Slow Flow', type: 'YOGA', intensity: 'LOW', dayOfWeek: 'SATURDAY', startTime: '09:30', endTime: '10:45', capacity: 16, spotsTaken: 8, description: 'Long, luxurious sequencing with hands-on assists.', instructorName: 'Keyla Lie' },
  { title: 'Pilates Booty Lab', type: 'PILATES', intensity: 'MEDIUM', dayOfWeek: 'SATURDAY', startTime: '11:00', endTime: '12:00', capacity: 14, spotsTaken: 13, description: 'Glute-focused reformer and mat work.', instructorName: 'Sienna Brooks' },
  { title: 'Strongwoman Saturday', type: 'STRENGTH', intensity: 'HIGH', dayOfWeek: 'SATURDAY', startTime: '12:00', endTime: '13:15', capacity: 14, spotsTaken: 5, description: 'Sled pushes, farmer carries, tire flips.', instructorName: 'Jordan Lewis' },

  // Sunday
  { title: 'Sunday Reset', type: 'YOGA', intensity: 'LOW', dayOfWeek: 'SUNDAY', startTime: '09:00', endTime: '10:15', capacity: 16, spotsTaken: 12, description: 'Set intentions for the week. Tea after class.', instructorName: 'Keyla Lie' },
  { title: 'Barre Brunch', type: 'BARRE', intensity: 'MEDIUM', dayOfWeek: 'SUNDAY', startTime: '10:30', endTime: '11:30', capacity: 16, spotsTaken: 7, description: 'Low-weights, high-rep burnout, then brunch.', instructorName: 'Sienna Brooks' },
  { title: 'Recovery Ride', type: 'CYCLING', intensity: 'LOW', dayOfWeek: 'SUNDAY', startTime: '12:00', endTime: '13:00', capacity: 24, spotsTaken: 6, description: 'Zone 2 spinning. Conversation allowed.', instructorName: 'Aria Rodriguez' },
]

async function main() {
  for (const instructor of INSTRUCTORS) {
    await db.instructor.upsert({ where: { id: instructor.id }, update: instructor, create: instructor })
  }
  console.log(`Seeded ${INSTRUCTORS.length} instructors`)

  for (const membership of MEMBERSHIPS) {
    await db.membership.upsert({ where: { id: membership.id }, update: membership, create: membership })
  }
  console.log(`Seeded ${MEMBERSHIPS.length} memberships`)

  // Classes are keyed by natural key (title + day + start) — upsert for idempotence.
  let created = 0
  for (let i = 0; i < SCHEDULE.length; i++) {
    const c = SCHEDULE[i]
    if (!c) continue
    const existing = await db.studioClass.findFirst({
      where: { title: c.title, dayOfWeek: c.dayOfWeek, startTime: c.startTime },
    })
    if (existing) {
      await db.studioClass.update({ where: { id: existing.id }, data: { ...c, sortOrder: i } })
    } else {
      await db.studioClass.create({ data: { ...c, sortOrder: i } })
      created++
    }
  }
  console.log(`Seeded ${SCHEDULE.length} classes (${created} new)`)

  const counts = {
    instructors: await db.instructor.count(),
    memberships: await db.membership.count(),
    classes: await db.studioClass.count(),
  }
  console.log('Final counts:', counts)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
