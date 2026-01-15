import { supabaseAdmin } from './src/lib/supabaseAdmin.ts';

async function updateUserMetadata() {
  try {
    // First, get the user from Supabase
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

    console.log('User metadata updated successfully:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

updateUserMetadata();