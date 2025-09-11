'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

const SignInForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            const response = await fetch(`${apiUrl}/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    contraseña: formData.password
                }),
                credentials: 'include', // Incluir cookies
            });

            if (response.ok) {
                const data = await response.json();
                login(); // Ahora no necesita parámetro
                
                // Redirigir según el rol
                if (data.rol === 'docente') {
                    window.location.href = '/docente';
                } else {
                    if (!data.grupo_id) {
                        window.location.href = '/estudiante/sin-grupo';
                    } else {
                        window.location.href = '/estudiante/con-grupo';
                    }
                    
                }
            } else {
                alert('Credenciales incorrectas');
            }
        } catch (error) {
            alert('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signin-form">
            <h2>Iniciar Sesión</h2>
            <p>Ingresa tus credenciales para acceder</p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
            </form>

            <div className="form-footer">
                <p>
                    ¿No tienes cuenta? <Link href="/sign-up">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
};

export default SignInForm;