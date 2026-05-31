import type { Instrument, Member } from '../types'

export function getPreferredInstrumentOptions(
  member: Member,
): { instrument: Instrument; label: string }[] {
  return member.instruments.map((instrument) => ({
    instrument,
    label: instrument,
  }))
}

export function getDefaultInstrument(member: Member): Instrument {
  return member.instruments[0] ?? 'ボーカル'
}
