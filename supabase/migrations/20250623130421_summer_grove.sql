/*
  # Fix Users Table Insert Policy

  1. Security Changes
    - Drop the existing faulty insert policy
    - Create a new insert policy that properly allows authenticated users to insert their own data
    - Use auth.uid() instead of uid() for proper authentication context

  The existing policy was using uid() which may not work correctly in all contexts.
  This migration replaces it with a policy using auth.uid() which is the recommended approach.
*/

-- Drop the existing faulty policy
DROP POLICY IF EXISTS "Anyone can insert user data" ON users;

-- Create a new policy that allows authenticated users to insert their own user data
CREATE POLICY "Allow authenticated users to insert their own user data" 
  ON users 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);