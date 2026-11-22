/** Apps Script can return HTTP 200 for both a saved row and an application error. */
export async function writeSheetsEvent(payload: Record<string, unknown>): Promise<boolean> {
  const url = process.env.SHEETS_WEBHOOK_URL?.trim()
  if (!url) {
    console.error('Sheets delivery failed: SHEETS_WEBHOOK_URL is missing')
    return false
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      cache: 'no-store',
    })
    if (!response.ok) {
      console.error('Sheets delivery failed: HTTP', response.status)
      return false
    }

    const receipt = await response.json()
    if (receipt?.success !== true) {
      console.error('Sheets delivery failed: webhook did not confirm the write')
      return false
    }
    return true
  } catch (error) {
    // A sign-in page, an invalid receipt and a transport failure all leave the write unconfirmed.
    console.error('Sheets delivery failed:', error instanceof Error ? error.name : 'unknown error')
    return false
  }
}
