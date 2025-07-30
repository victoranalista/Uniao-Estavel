import React from 'react';
import { prisma } from '@/lib/prisma';
import EditUserForm from './EditUserForm';

export default async function EditUserPage({
  params
}: {
  params: Promise<{ id: number }>;
}) {
  const userId = (await params).id;
  const userData = await prisma.userHistory.findUnique({
    where: { id: Number(userId) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      password: true,
      status: true
    }
  });
  if (!userData)
    return (
      <div className="text-center text-red-500">Usuário não encontrado.</div>
    );
  const initialValues = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    status: userData.status,
    password: userData.password ?? ''
  };
  return <EditUserForm initialValues={initialValues} />;
}
