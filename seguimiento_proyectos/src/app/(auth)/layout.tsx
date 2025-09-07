// app/(auth)/layout.tsx
import React from 'react';
import DecorationPanel from '../../components/DecorationPanel';
import AuthForm from '../../components/AuthForm';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="auth-layout">
      <DecorationPanel />
      <AuthForm>
        {children}
      </AuthForm>
    </div>
  );
};

export default Layout;