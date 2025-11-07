'use client';

import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hideLabel?: boolean;
}

export default function Input({ label, hideLabel = false, ...props }: InputProps) {
  return (
    <>
      {label && !hideLabel && <label style={{ display: 'none' }}>{label}</label>}
      <input {...props} />
    </>
  );
}