export const INTAKE_ORIGIN = 'https://blacnova.pages.dev'

export function clientIntakeUrl(clientName: string): string {
  return `${INTAKE_ORIGIN}/for/${encodeURIComponent(clientName.trim())}`
}
