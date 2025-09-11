// app/(auth)/components/AuthForm.tsx
import React from 'react';

interface AuthFormProps {
  children: React.ReactNode;
}

const AuthForm = ({ children }: AuthFormProps) => {
  return (
    <div className="auth-form">
      <div className="auth-form-container">
        {children}
      </div>
    </div>
  );
};

export default AuthForm;