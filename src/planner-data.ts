// UI demo only: the reference date is fixed, not the device's current date.
// All medication names and values below are fictional placeholders.
export const REFERENCE_DATE = '2026-10-13'
export type Medication = {
  id: number; name: string; strength: string; stock: number; days: number;
  risk: 'normal' | 'soon' | 'critical' | 'unknown'; unit: string;
  perDose?: number; timesDaily?: number; refillDeadline?: string; lastPickupDate?: string;
}

export function dateAt(date: string, offset = 0): string {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + offset)
  return value.toISOString().slice(0, 10)
}

export function shortDate(date: string): string {
  const [, month, day] = date.split('-').map(Number)
  return `${month}月${day}日`
}

export function coverageDays(stock: number, perDose: number, timesDaily: number): number {
  // Fixed-point quantities avoid fractional tablet rounding at day boundaries.
  const daily = Math.round(perDose * 1000) * timesDaily
  return daily > 0 ? Math.floor(Math.round(stock * 1000) / daily) : 0
}

export function finishDate(med: Medication): string | null {
  return med.risk === 'unknown' || med.days < 1 ? null : dateAt(REFERENCE_DATE, med.days - 1)
}

export function remainingAt(med: Medication, offset: number): number | null {
  if (med.perDose === undefined || med.timesDaily === undefined) return null
  return Math.max(0, Math.round(med.stock * 1000) - Math.round(med.perDose * 1000) * med.timesDaily * offset) / 1000
}

const medicationRecords: Omit<Medication, 'days'>[] = [
  { id: 1, name: '示例药物甲', strength: '示例规格 A', stock: 60, risk: 'normal', unit: '单位', perDose: 1, timesDaily: 1, refillDeadline: '2026-11-17', lastPickupDate: '2026-09-18' },
  { id: 2, name: '示例药物乙', strength: '示例规格 B', stock: 12, risk: 'soon', unit: '单位', perDose: 1, timesDaily: 1, refillDeadline: '2026-10-26', lastPickupDate: '2026-09-30' },
  { id: 3, name: '示例药物丙', strength: '示例规格 C', stock: 6, risk: 'critical', unit: '单位', perDose: 1, timesDaily: 1, refillDeadline: '2026-10-19', lastPickupDate: '2026-10-01' },
  { id: 4, name: '示例药物丁', strength: '示例规格 D', stock: 30, risk: 'normal', unit: '单位', perDose: 0.5, timesDaily: 1, refillDeadline: '2026-11-12', lastPickupDate: '2026-09-29' },
  { id: 5, name: '示例药物戊', strength: '示例规格 E', stock: 20, risk: 'soon', unit: '单位', perDose: 2, timesDaily: 1, refillDeadline: '2026-10-27', lastPickupDate: '2026-10-02' },
]

export const initialMedications: Medication[] = medicationRecords.map(med => ({
  ...med, days: coverageDays(med.stock, med.perDose!, med.timesDaily!),
}))

// Historical pickup dates are stored on each medication. Future pickup events
// remain empty until the user confirms a hospital date and quantity.
export const pickupEvents: { date: string; medicationIds: number[] }[] = []

export const hospitalUnconfirmed = (date: string) => date >= '2026-10-24' && date <= '2026-10-25'

export function eventsOn(date: string, medications: Medication[]) {
  const events: { kind: 'pickup' | 'finish' | 'hospital'; text: string }[] = []
  for (const pickup of pickupEvents.filter(item => item.date === date)) {
    const names = medications.filter(med => pickup.medicationIds.includes(med.id)).map(med => med.name)
    if (names.length) events.push({ kind: 'pickup', text: `计划取药：${names.join('、')}` })
  }
  const finished = medications.filter(med => finishDate(med) === date).map(med => med.name)
  if (finished.length) events.push({ kind: 'finish', text: `预计吃完：${finished.join('、')}` })
  if (hospitalUnconfirmed(date)) events.push({ kind: 'hospital', text: '医院假期开放时间待确认' })
  return events
}
