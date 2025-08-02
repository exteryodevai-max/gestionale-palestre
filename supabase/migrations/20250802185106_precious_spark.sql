/*
  # Add Foreign Key Constraints to Course Instances

  1. Foreign Key Constraints
    - Add foreign key constraint from `course_instances.course_id` to `courses.id`
    - Add foreign key constraint from `course_instances.trainer_id` to `users.id`
    - Add foreign key constraint from `course_instances.area_id` to `areas.id`

  2. Purpose
    - Enable Supabase to understand table relationships for JOIN queries
    - Ensure data integrity between related tables
    - Allow the calendar component to fetch related data properly
*/

-- Add foreign key constraint for course_id
ALTER TABLE course_instances 
ADD CONSTRAINT IF NOT EXISTS fk_course_instances_course_id 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- Add foreign key constraint for trainer_id
ALTER TABLE course_instances 
ADD CONSTRAINT IF NOT EXISTS fk_course_instances_trainer_id 
FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add foreign key constraint for area_id
ALTER TABLE course_instances 
ADD CONSTRAINT IF NOT EXISTS fk_course_instances_area_id 
FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL;