import type { Instrument, Member } from '../types'

export function getPreferredInstrumentOptions(
  member: Member,
): { instrument: Instrument; label: string }[] {
  const options: { instrument: Instrument; label: string }[] = []
  options.push({ instrument: member.preferredRole1, label: '第1' })
  if (member.preferredRole2 !== member.preferredRole1) {
    options.push({ instrument: member.preferredRole2, label: '第2' })
  }
  return options
}
