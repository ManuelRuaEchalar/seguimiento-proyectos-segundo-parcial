// app/(auth)/layout.tsx
import React from 'react';
import DecorationPanel from '../../components/inicio-sesion/DecorationPanel';
import AuthForm from '../../components/inicio-sesion/AuthForm';

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