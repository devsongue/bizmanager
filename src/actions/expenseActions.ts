"use server";

import { prisma } from '@/lib/prisma';
import { Expense } from '@/types';

// Fetch expenses for a business
export async function getExpenses(businessId: string) {
  try {
    const expenses = await prisma.expense.findMany({
      where: { businessId },
    });
    
    return { success: true, data: expenses };
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return { success: false, error: 'Failed to fetch expenses' };
  }
}

// Create a new expense
export async function createExpense(businessId: string, expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) {
  try {
    // Generate a unique reference if not provided
    const reference = expenseData.reference || `EXP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const expense = await prisma.expense.create({
      data: {
        id: `exp-${Date.now()}`,
        reference: reference,
        date: new Date(expenseData.date),
        category: expenseData.category,
        description: expenseData.description,
        amount: expenseData.amount,
        paymentMethod: expenseData.paymentMethod,
        receiptUrl: expenseData.receiptUrl,
        approvedById: expenseData.approvedById,
        businessId: businessId,
      },
    });
    
    return { success: true, data: expense };
  } catch (error) {
    console.error('Error creating expense:', error);
    return { success: false, error: 'Failed to create expense' };
  }
}

// Update an expense
export async function updateExpense(id: string, expenseData: Partial<Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>) {
  try {
    const expense = await prisma.expense.update({
      where: { id },
      data: expenseData,
    });
    
    return { success: true, data: expense };
  } catch (error) {
    console.error('Error updating expense:', error);
    return { success: false, error: 'Failed to update expense' };
  }
}

// Delete an expense
export async function deleteExpense(id: string) {
  try {
    await prisma.expense.delete({
      where: { id },
    });
    
    return { success: true, message: 'Expense deleted successfully' };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { success: false, error: 'Failed to delete expense' };
  }
}