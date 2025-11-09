"use server";

import { prisma } from '@/lib/prisma';
import { User, ActionResult } from '@/types';

// Fetch all users
export async function getUsers(): Promise<ActionResult<User[]>> {
  try {
    const users = await prisma.user.findMany({
      include: {
        managedBusinesses: true
      }
    });
    // Map Prisma user objects to our User interface
    const mappedUsers: User[] = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password ?? undefined,
      role: user.role,
      avatarUrl: user.avatarUrl,
      managedBusinessIds: user.managedBusinesses?.map((business: any) => business.id) || []
    }));
    return { success: true, data: mappedUsers };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

// Create a new user
export async function createUser(userData: Omit<User, 'id'>): Promise<ActionResult<User>> {
  try {
    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    
    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }
    
    // Préparer les données pour la création
    const createData: any = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: userData.password ?? null,
      role: userData.role,
      avatarUrl: userData.avatarUrl,
    };
    
    // Si l'utilisateur est un gérant avec des entreprises assignées, les connecter
    if (userData.role === 'Gérant' && userData.managedBusinessIds && userData.managedBusinessIds.length > 0) {
      createData.managedBusinesses = {
        connect: userData.managedBusinessIds.map(id => ({ id }))
      };
    }
    
    const user = await prisma.user.create({
      data: createData,
      include: {
        managedBusinesses: true
      }
    });
    
    // Map to our User interface
    const mappedUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password ?? undefined,
      role: user.role,
      avatarUrl: user.avatarUrl,
      managedBusinessIds: user.managedBusinesses?.map((business: any) => business.id) || []
    };
    
    return { success: true, data: mappedUser };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user: ' + (error as Error).message };
  }
}

// Update a user
export async function updateUser(id: string, userData: Partial<User>): Promise<ActionResult<User>> {
  try {
    // Préparer les données pour la mise à jour
    const updateData: any = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatarUrl: userData.avatarUrl,
    };
    
    // Mettre à jour le mot de passe seulement s'il est fourni
    if (userData.password !== undefined) {
      updateData.password = userData.password ?? null;
    }
    
    // Gérer l'assignation des entreprises selon le rôle
    if (userData.role === 'Admin') {
      // Un admin ne gère aucune entreprise spécifique
      updateData.managedBusinesses = {
        set: []
      };
    } else if (userData.role === 'Gérant') {
      // Un gérant peut être assigné à une ou plusieurs entreprises
      // Si managedBusinessIds est fourni, on met à jour les assignations
      // Sinon, on garde les assignations existantes
      if (userData.managedBusinessIds !== undefined) {
        updateData.managedBusinesses = {
          set: userData.managedBusinessIds.map(id => ({ id }))
        };
      }
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        managedBusinesses: true
      }
    });
    
    // Map to our User interface
    const mappedUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password ?? undefined,
      role: user.role,
      avatarUrl: user.avatarUrl,
      managedBusinessIds: user.managedBusinesses?.map((business: any) => business.id) || []
    };
    
    return { success: true, data: mappedUser };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Failed to update user: ' + (error as Error).message };
  }
}

// Delete a user
export async function deleteUser(id: string): Promise<ActionResult<{ message: string }>> {
  try {
    await prisma.user.delete({
      where: { id },
    });
    
    return { success: true, data: { message: 'User deleted successfully' } };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}

// Authenticate user
export async function authenticateUser(email: string, password: string): Promise<ActionResult<Omit<User, 'password'>>> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        managedBusinesses: true
      }
    });
    
    // Check if user exists and password matches
    // Note: In a production environment, you should use proper password hashing
    if (user && user.password === password) {
      // Map to our User interface without password
      const userWithoutPassword: Omit<User, 'password'> = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        managedBusinessIds: user.managedBusinesses?.map((business: any) => business.id) || []
      };
      return { success: true, data: userWithoutPassword };
    }
    
    return { success: false, error: 'Invalid email or password' };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return { success: false, error: 'Failed to authenticate user' };
  }
}