export interface Activity {
  id: string
  user_id: string
  subject: string
  is_repetition: boolean
  is_exercise: boolean
  is_completed: boolean
  notes: string | null
  date: string // YYYY-MM-DD
  time_start?: string | null
  time_end?: string | null
  created_at: string
  series_id?: string | null
}

export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  birth_date: string
  username: string
  is_active: boolean
}
