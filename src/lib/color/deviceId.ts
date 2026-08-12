// Client-generated identity for the public Website Prompt Generator's quota
// enforcement. This is a soft signal only — the edge function is the actual
// trust boundary and also tracks request IP jointly (see the plan/migration
// comment on website_prompt_generations for the full rationale). Clearing
// localStorage resets this signal but not the IP signal.
const STORAGE_KEY = 'sfd_prompt_gen_device_id'

export function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}
