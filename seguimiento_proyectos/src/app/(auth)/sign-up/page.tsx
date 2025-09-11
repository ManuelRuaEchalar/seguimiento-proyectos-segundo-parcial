// app/(auth)/sign-up/page.tsx
'use client';
import React, { useState } from 'react';
import RoleSelector from '../../../components/inicio-sesion/RoleSelector';
import SignUpForm from '../../../components/inicio-sesion/SignUpForm';

const SignUpPage = () => {
  const [selectedRole, setSelectedRole] = useState<'estudiante' | 'docente' | null>(null);

  const handleRoleSelect = (role: 'estudiante' | 'docente') => {
    setSelectedRole(role);
  };

  const handleBack = () => {
    setSelectedRole(null);
  };

  return (
    <>
      {selectedRole ? (
        <SignUpForm role={selectedRole} onBack={handleBack} />
      ) : (
        <RoleSelector onRoleSelect={handleRoleSelect} />
      )}
    </>
  );
};

export default SignUpPage;