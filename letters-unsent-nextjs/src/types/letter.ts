export type Letter = {
  id: string
  content: string
  intended_recipient: string | null
  author_name: string | null
  relationship_type: string | null
  emotional_tone: string | null
  created_at: string
  updated_at: string | null
}
