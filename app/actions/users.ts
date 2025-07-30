'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';

interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

const createUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(100),
  role: z.enum(['ADMIN', 'USER']),
  taxpayerId: z.string().min(11, 'taxpayerId/CNPJ é obrigatório').max(18),
});

const updateUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255).optional(),
  email: z.string().email('Email inválido').max(255).optional(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(100).optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export async function createUser(userData: unknown): Promise<ActionResult> {
  try {
     const session = await requireSession([Role.ADMIN, Role.USER])

    // Check if user has admin role (assuming session includes role)
    const currentUserData = await prisma.userHistory.findFirst({
      where: { 
        user: { taxpayerId: session.user.email || '' },
        status: 'ACTIVE'
      },
      orderBy: { version: 'desc' }
    });

    if (!currentUserData || currentUserData.role !== 'ADMIN') {
      return { success: false, error: 'Acesso negado' };
    }

    const validatedData = createUserSchema.parse(userData);

    // Check if taxpayer ID already exists
    const existingUser = await prisma.user.findUnique({
      where: { taxpayerId: validatedData.taxpayerId },
    });

    if (existingUser) {
      return { success: false, error: 'taxpayerId/CNPJ já cadastrado' };
    }

    // Check if email already exists in any user history
    const existingEmail = await prisma.userHistory.findFirst({
      where: { 
        email: validatedData.email,
        status: 'ACTIVE'
      },
    });

    if (existingEmail) {
      return { success: false, error: 'Email já cadastrado' };
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const user = await prisma.$transaction(async (transaction) => {
      // Create user record
      const newUser = await transaction.user.create({
        data: {
          taxpayerId: validatedData.taxpayerId,
          status: 'ACTIVE',
        },
      });

      // Create first version in user history
      const userHistory = await transaction.userHistory.create({
        data: {
          userId: newUser.id,
          version: 1,
          name: validatedData.name,
          email: validatedData.email,
          role: validatedData.role,
          password: hashedPassword,
          status: 'ACTIVE',
        },
      });

      return {
        id: newUser.id,
        taxpayerId: newUser.taxpayerId,
        name: userHistory.name,
        email: userHistory.email,
        role: userHistory.role,
        status: userHistory.status,
        createdAt: newUser.createdAt,
      };
    });

    revalidatePath('/dashboard/settings/users');
    return { success: true, data: user };
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Dados inválidos' };
    }
    
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getAllUsers(): Promise<ActionResult> {
  try {
    const session = await requireSession([Role.ADMIN, Role.USER])

    // Get current user role
    const currentUserData = await prisma.userHistory.findFirst({
      where: { 
        user: { taxpayerId: session.user.email || '' },
        status: 'ACTIVE'
      },
      orderBy: { version: 'desc' }
    });

    if (!currentUserData || !['ADMIN', 'USER'].includes(currentUserData.role)) {
      return { success: false, error: 'Acesso negado' };
    }

    // Get all users with their latest version
    const users = await prisma.user.findMany({
      include: {
        versions: {
          where: {
            version: {
              in: await prisma.userHistory.groupBy({
                by: ['userId'],
                _max: { version: true },
              }).then(groups => 
                groups.map(g => g._max.version).filter(Boolean) as number[]
              )
            }
          },
          orderBy: { version: 'desc' },
          take: 1,
        }
      },
      orderBy: [
        { status: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    const formattedUsers = users.map(user => {
      const latestVersion = user.versions[0];
      return {
        id: user.id,
        taxpayerId: user.taxpayerId,
        name: latestVersion?.name || '',
        email: latestVersion?.email || '',
        role: latestVersion?.role || 'USER',
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });

    return { success: true, data: formattedUsers };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Erro ao buscar usuários' };
  }
}

export async function updateUser(userId: number, userData: unknown): Promise<ActionResult> {
  try {
    const session = await requireSession([Role.ADMIN, Role.USER])

    const currentUserData = await prisma.userHistory.findFirst({
      where: { 
        user: { taxpayerId: session.user.email || '' },
        status: 'ACTIVE'
      },
      orderBy: { version: 'desc' }
    });

    if (!currentUserData || currentUserData.role !== 'ADMIN' ) {
      return { success: false, error: 'Acesso negado' };
    }

    const validatedData = updateUserSchema.parse(userData);

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        }
      }
    });

    if (!currentUser) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const latestVersion = currentUser.versions[0];
    if (!latestVersion) {
      return { success: false, error: 'Dados do usuário não encontrados' };
    }

    // Check email uniqueness if email is being updated
    if (validatedData.email && validatedData.email !== latestVersion.email) {
      const existingEmail = await prisma.userHistory.findFirst({
        where: { 
          email: validatedData.email,
          status: 'ACTIVE',
          userId: { not: userId }
        },
      });

      if (existingEmail) {
        return { success: false, error: 'Email já cadastrado' };
      }
    }

    const updatedUser = await prisma.$transaction(async (transaction) => {
      // Update user status if provided
      if (validatedData.status) {
        await transaction.user.update({
          where: { id: userId },
          data: { status: validatedData.status },
        });
      }

      // Create new version if data is being updated
      const updateData: any = {
        userId,
        version: latestVersion.version + 1,
        name: validatedData.name || latestVersion.name,
        email: validatedData.email || latestVersion.email,
        role: validatedData.role || latestVersion.role,
        status: validatedData.status || latestVersion.status,
        totpSecret: latestVersion.totpSecret,
        totpEnabled: latestVersion.totpEnabled,
        totpVerifiedAt: latestVersion.totpVerifiedAt,
      };

      if (validatedData.password) {
        updateData.password = await bcrypt.hash(validatedData.password, 12);
      } else {
        updateData.password = latestVersion.password;
      }

      const newVersion = await transaction.userHistory.create({
        data: updateData,
      });

      return {
        id: userId,
        taxpayerId: currentUser.taxpayerId,
        name: newVersion.name,
        email: newVersion.email,
        role: newVersion.role,
        status: validatedData.status || currentUser.status,
        updatedAt: new Date(),
      };
    });

    revalidatePath('/dashboard/settings/users');
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Dados inválidos' };
    }
    
    return { success: false, error: 'Erro ao atualizar usuário' };
  }
}

export async function deactivateUser(userId: number): Promise<ActionResult> {
  try {
    const session = await requireSession([Role.ADMIN, Role.USER])

    const currentUserData = await prisma.userHistory.findFirst({
      where: { 
        user: { taxpayerId: session.user.email || '' },
        status: 'ACTIVE'
      },
      orderBy: { version: 'desc' }
    });

    if (!currentUserData || currentUserData.role !== 'ADMIN') {
      return { success: false, error: 'Acesso negado' };
    }

    if (currentUserData.userId === userId) {
      return { success: false, error: 'Não é possível desativar sua própria conta' };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: 'INACTIVE' },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        }
      }
    });

    const latestVersion = user.versions[0];

    revalidatePath('/dashboard/settings/users');
    return { 
      success: true, 
      data: {
        id: user.id,
        taxpayerId: user.taxpayerId,
        name: latestVersion?.name || '',
        email: latestVersion?.email || '',
        role: latestVersion?.role || 'USER',
        status: user.status,
      }
    };
  } catch (error) {
    console.error('Error deactivating user:', error);
    return { success: false, error: 'Erro ao desativar usuário' };
  }
}

export async function activateUser(userId: number): Promise<ActionResult> {
  try {
    const session = await requireSession([Role.ADMIN, Role.USER])

    const currentUserData = await prisma.userHistory.findFirst({
      where: { 
        user: { taxpayerId: session.user.email || '' },
        status: 'ACTIVE'
      },
      orderBy: { version: 'desc' }
    });

    if (!currentUserData || currentUserData.role !== 'ADMIN') {
      return { success: false, error: 'Acesso negado' };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        }
      }
    });

    const latestVersion = user.versions[0];

    revalidatePath('/dashboard/settings/users');
    return { 
      success: true, 
      data: {
        id: user.id,
        taxpayerId: user.taxpayerId,
        name: latestVersion?.name || '',
        email: latestVersion?.email || '',
        role: latestVersion?.role || 'USER',
        status: user.status,
      }
    };
  } catch (error) {
    console.error('Error activating user:', error);
    return { success: false, error: 'Erro ao ativar usuário' };
  }
}