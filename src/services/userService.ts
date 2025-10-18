import { supabase, type User, type WorkExperience, type Education } from './supabase';

export class UserService {
  // Get or create user by wallet address
  async getOrCreateUser(walletAddress: string): Promise<User> {
    // Try to get existing user using maybeSingle() which doesn't throw on no rows
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    // If there's an error other than "no rows", throw it
    if (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }

    // User exists
    if (data) {
      return data as User;
    }

    // Create new user with upsert to handle race conditions
    const newUser: Partial<User> = {
      wallet_address: walletAddress,
      name: '',
      description: '',
      skills: [],
      work_experience: [],
      education: [],
      role: 'freelancer',
    };

    const { data: createdUser, error: createError } = await supabase
      .from('users')
      .upsert([newUser], { onConflict: 'wallet_address' })
      .select()
      .single();

    if (createError) {
      throw new Error(`Error creating user: ${createError.message}`);
    }

    return createdUser as User;
  }

  // Update user profile
  async updateProfile(
    walletAddress: string,
    profile: {
      name: string;
      description: string;
      skills: string[];
      work_experience: WorkExperience[];
      education: Education[];
    }
  ): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: profile.name,
        description: profile.description,
        skills: profile.skills,
        work_experience: profile.work_experience,
        education: profile.education,
      })
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating profile: ${error.message}`);
    }

    return data as User;
  }

  // Get user by wallet address
  async getUser(walletAddress: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    if (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }

    return data as User | null;
  }

  // Update user role
  async updateRole(walletAddress: string, role: 'client' | 'freelancer'): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('wallet_address', walletAddress);

    if (error) {
      throw new Error(`Error updating role: ${error.message}`);
    }
  }
}

export const userService = new UserService();

