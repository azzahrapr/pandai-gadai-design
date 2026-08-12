// Device catalog for the "Cari Barang" search in the Penaksiran Elektronik discounter
// form (FLPenaksiranConfirm.tsx) — adapted from the reference simulasi-gadai app's
// mockHpItems.ts (same brand/model list), minus its price/basis-nilai fields since this
// is a practice form with no computed estimate (kanit reviews the filled-out form itself,
// not a derived payout number).
interface HpItem {
  merek: string
  model: string
  spesifikasi: string
  tahun: string
}

const HP_ITEMS_RAW: HpItem[] = [
  { merek: 'Samsung', model: 'Galaxy S23 Plus', spesifikasi: '8 / 256 GB', tahun: '2023' },
  { merek: 'Samsung', model: 'Galaxy A71', spesifikasi: '8 / 128 GB', tahun: '2020' },
  { merek: 'Samsung', model: 'Galaxy M62', spesifikasi: '8 / 256 GB', tahun: '2021' },
  { merek: 'Samsung', model: 'Galaxy A73', spesifikasi: '8 / 256 GB', tahun: '2022' },
  { merek: 'Samsung', model: 'Galaxy M20', spesifikasi: '3 / 32 GB', tahun: '2019' },
  { merek: 'Samsung', model: 'Galaxy S22 Ultra', spesifikasi: '12 / 256 GB', tahun: '2022' },
  { merek: 'Samsung', model: 'Galaxy A54', spesifikasi: '8 / 256 GB', tahun: '2023' },
  { merek: 'Samsung', model: 'Galaxy Note 20', spesifikasi: '8 / 256 GB', tahun: '2020' },
  { merek: 'Apple', model: 'iPhone 13', spesifikasi: '4 / 128 GB', tahun: '2021' },
  { merek: 'Apple', model: 'iPhone 14 Pro', spesifikasi: '6 / 256 GB', tahun: '2022' },
  { merek: 'Apple', model: 'iPhone 12', spesifikasi: '4 / 64 GB', tahun: '2020' },
  { merek: 'Apple', model: 'iPhone SE', spesifikasi: '4 / 64 GB', tahun: '2022' },
  { merek: 'Apple', model: 'iPhone 15', spesifikasi: '6 / 128 GB', tahun: '2023' },
  { merek: 'Apple', model: 'iPhone 11', spesifikasi: '4 / 64 GB', tahun: '2019' },
  { merek: 'Oppo', model: 'Reno 8', spesifikasi: '8 / 256 GB', tahun: '2022' },
  { merek: 'Oppo', model: 'A96', spesifikasi: '8 / 128 GB', tahun: '2022' },
  { merek: 'Oppo', model: 'Find X5', spesifikasi: '8 / 256 GB', tahun: '2022' },
  { merek: 'Oppo', model: 'A54', spesifikasi: '6 / 128 GB', tahun: '2021' },
  { merek: 'Infinix', model: 'Note 12', spesifikasi: '8 / 128 GB', tahun: '2022' },
  { merek: 'Infinix', model: 'Hot 30', spesifikasi: '8 / 128 GB', tahun: '2023' },
  { merek: 'Infinix', model: 'Zero 20', spesifikasi: '8 / 256 GB', tahun: '2022' },
  { merek: 'Infinix', model: 'Smart 6', spesifikasi: '4 / 64 GB', tahun: '2021' },
  { merek: 'Xiaomi', model: 'Redmi Note 11', spesifikasi: '6 / 128 GB', tahun: '2022' },
  { merek: 'Xiaomi', model: 'Redmi 10', spesifikasi: '4 / 128 GB', tahun: '2021' },
  { merek: 'Xiaomi', model: 'Poco X4 Pro', spesifikasi: '6 / 128 GB', tahun: '2022' },
  { merek: 'Xiaomi', model: 'Mi 11', spesifikasi: '8 / 256 GB', tahun: '2021' },
  { merek: 'Vivo', model: 'V25', spesifikasi: '8 / 256 GB', tahun: '2022' },
  { merek: 'Vivo', model: 'Y21', spesifikasi: '4 / 64 GB', tahun: '2021' },
  { merek: 'Vivo', model: 'V27', spesifikasi: '8 / 256 GB', tahun: '2023' },
  { merek: 'Realme', model: '9', spesifikasi: '8 / 128 GB', tahun: '2022' },
  { merek: 'Realme', model: 'C35', spesifikasi: '4 / 128 GB', tahun: '2022' },
  { merek: 'Realme', model: 'GT Neo 3', spesifikasi: '8 / 256 GB', tahun: '2022' },
]

function toLabel(item: HpItem): string {
  return `${item.merek.toUpperCase()} ${item.model.toUpperCase()} ${item.spesifikasi} ${item.tahun}`
}

export const HP_ITEMS: HpItem[] = HP_ITEMS_RAW
export const HP_ITEM_LABELS: string[] = HP_ITEMS.map(toLabel)

export function parseHpItemLabel(label: string): HpItem | null {
  return HP_ITEMS.find(item => toLabel(item) === label) ?? null
}
