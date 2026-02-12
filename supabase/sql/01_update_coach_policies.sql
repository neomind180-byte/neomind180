-- ============================================
-- STEP 1: Update Coach Policies
-- ============================================
-- Replace COACH_UUID_HERE with your actual coach UUID
-- (Get it from Supabase Dashboard → Authentication → Users → find eve-life@neomind180.com)

-- Policy: Coach can view all messages
CREATE POLICY "Coach can view all messages"
  ON public.coach_messages
  FOR SELECT
  TO authenticated
```sql
  USING (auth.uid() = 'c1cadec4-45d9-4e98-aac6-b3b8112356e9'::uuid);
```

-- Policy: Coach can update messages (add replies)
CREATE POLICY "Coach can update messages"
  ON public.coach_messages
  FOR UPDATE
  TO authenticated
```sql
  USING (auth.uid() = 'c1cadec4-45d9-4e98-aac6-b3b8112356e9'::uuid)
```
```sql
  WITH CHECK (auth.uid() = 'c1cadec4-45d9-4e98-aac6-b3b8112356e9'::uuid);
```
