// Motor catalog for Penaksiran BPKB's "Pilih Item" search (FLPenaksiranBpkbConfirm.tsx) —
// adapted from the reference simulasi-gadai app's mockMotorItems.ts (same brand/model/year
// list), minus price/basis-nilai fields — this is a practice form with no computed
// estimate, the FL enters Basis Nilai Taksiran themselves as a data-entry exercise.
interface MotorItem {
  merek: string
  model: string
  tahun: string
}

const MODELS: Array<{ merek: string; model: string }> = [
  { merek: 'Yamaha', model: 'Fino 125' },
  { merek: 'Yamaha', model: 'Nmax 155' },
  { merek: 'Yamaha', model: 'Mio M3 125' },
  { merek: 'Honda', model: 'Beat 125' },
  { merek: 'Honda', model: 'Vario 160' },
  { merek: 'Honda', model: 'Scoopy 110' },
  { merek: 'Suzuki', model: 'Address 110' },
  { merek: 'Kawasaki', model: 'KLX 150' },
]

const YEARS = ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023']

export const MOTOR_ITEMS: MotorItem[] = MODELS.flatMap(m => YEARS.map(tahun => ({ merek: m.merek, model: m.model, tahun })))

function toLabel(item: MotorItem): string {
  return `${item.merek.toUpperCase()} ${item.model.toUpperCase()} ${item.tahun}`
}

export const MOTOR_ITEM_LABELS: string[] = MOTOR_ITEMS.map(toLabel)

export function parseMotorItemLabel(label: string): MotorItem | null {
  return MOTOR_ITEMS.find(item => toLabel(item) === label) ?? null
}
