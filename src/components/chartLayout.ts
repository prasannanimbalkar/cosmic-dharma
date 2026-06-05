/** Fixed rashi index (0=Aries … 11=Pisces) for each South Indian grid cell */
export const SOUTH_SIGN_LAYOUT: { sign: number; pos: string }[] = [
  { sign: 11, pos: 's-pi' },
  { sign: 0, pos: 's-ar' },
  { sign: 1, pos: 's-ta' },
  { sign: 2, pos: 's-ge' },
  { sign: 10, pos: 's-aq' },
  { sign: 3, pos: 's-cn' },
  { sign: 9, pos: 's-cp' },
  { sign: 4, pos: 's-le' },
  { sign: 8, pos: 's-sg' },
  { sign: 7, pos: 's-sc' },
  { sign: 6, pos: 's-li' },
  { sign: 5, pos: 's-vi' },
]

/**
 * Where the sign number sits inside each North Indian house (matches standard kundali apps).
 * - label-bc: bottom-centre of house (house 1 — top diamond)
 * - label-tc: top-centre (house 7 — bottom diamond)
 * - label-tl / tr / bl: corner of the house toward the chart edge
 */
export type LabelPlacement = 'label-tl' | 'label-tr' | 'label-bl' | 'label-tc' | 'label-bc'

export const NORTH_HOUSE_POSITIONS: {
  house: number
  x: number
  y: number
  place: LabelPlacement
}[] = [
  { house: 1, x: 50, y: 34, place: 'label-bc' },
  { house: 2, x: 21, y: 2, place: 'label-tl' },
  { house: 3, x: 4, y: 14, place: 'label-tl' },
  { house: 4, x: 23, y: 42, place: 'label-tl' },
  { house: 5, x: 5, y: 62, place: 'label-tl' },
  { house: 6, x: 22, y: 91, place: 'label-bl' },
  { house: 7, x: 50, y: 66, place: 'label-tc' },
  { house: 8, x: 76, y: 83, place: 'label-tr' },
  { house: 9, x: 95, y: 65, place: 'label-tr' },
  { house: 10, x: 71, y: 42, place: 'label-tl' },
  { house: 11, x: 95, y: 14, place: 'label-tr' },
  { house: 12, x: 72, y: 3, place: 'label-tl' },
]
