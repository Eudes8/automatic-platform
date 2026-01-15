import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateUserMetadata() {
  try {
    // Get the user from Supabase
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    const user = users.users.find(u => u.email === 'automaticbmje@gmail.com');

    if (!user) {
      console.error('User not found in Supabase');
      return;
    }

    console.log('Found user:', user.id);
    console.log('Current metadata:', user.app_metadata);

    // Update user metadata
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        role: 'ADMIN'
      }
    });

    if (error) {
      console.error('Error updating user metadata:', error);
      return;
    }

    console.log('User metadata updated successfully:', data.app_metadata);
  } catch (error) {
    console.error('Error:', error);
  }
}

updateUserMetadata();