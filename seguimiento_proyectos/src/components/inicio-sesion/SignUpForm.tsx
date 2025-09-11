// app/(auth)/components/SignUpForm.tsx
'use client';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface SignUpFormProps {
    role: 'estudiante' | 'docente';
    onBack: () => void;
}

interface DocenteData {
    rol: string;
    nombre: string;
    apellido: string;
    email: string;
    contraseña: string;
    codigo_docente: number;
}

interface EstudianteData {
    rol: string;
    nombre: string;
    apellido: string;
    email: string;
    cu: string;
    carrera: string;
    contraseña: string;
    grupo_id?: number;
}

const SignUpForm = ({ role, onBack }: SignUpFormProps) => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const [docenteData, setDocenteData] = useState<DocenteData>({
        rol: role,
        nombre: '',
        apellido: '',
        email: '',
        contraseña: '',
        codigo_docente: 0
    });

    const [estudianteData, setEstudianteData] = useState<EstudianteData>({
        rol: role,
        nombre: '',
        apellido: '',
        email: '',
        cu: '',
        carrera: '',
        contraseña: '',
    });

    const handleDocenteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setDocenteData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleEstudianteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setEstudianteData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            const data = role === 'docente' ? docenteData : estudianteData;

            const response = await fetch(`${apiUrl}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include',
            });

            if (response.ok) {
                const result = await response.json();
                login();
                
                if (result.rol === 'docente') {
                    window.location.href = '/docente';
                } else {
                    window.location.href = '/estudiante';
                }
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Error en el registro');
            }
        } catch (error) {
            alert('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-form">
            <button className="back-button" onClick={onBack}>
                ← Volver
            </button>

            <h2>Registro como {role}</h2>

            <form onSubmit={handleSubmit}>
                {role === 'docente' ? (
                    <>
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={docenteData.nombre}
                                onChange={handleDocenteChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="apellido">Apellido</label>
                            <input
                                type="text"
                                id="apellido"
                                name="apellido"
                                value={docenteData.apellido}
                                onChange={handleDocenteChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={docenteData.email}
                                onChange={handleDocenteChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="contraseña">Contraseña</label>
                            <input
                                type="password"
                                id="contraseña"
                                name="contraseña"
                                value={docenteData.contraseña}
                                onChange={handleDocenteChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="codigo_docente">Código de Docente</label>
                            <input
                                type="number"
                                id="codigo_docente"
                                name="codigo_docente"
                                value={docenteData.codigo_docente}
                                onChange={handleDocenteChange}
                                required
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={estudianteData.nombre}
                                onChange={handleEstudianteChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="apellido">Apellido</label>
                            <input
                                type="text"
                                id="apellido"
                                name="apellido"
                                value={estudianteData.apellido}
                                onChange={handleEstudianteChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={estudianteData.email}
                                onChange={handleEstudianteChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="contraseña">Contraseña</label>
                            <input
                                type="password"
                                id="contraseña"
                                name="contraseña"
                                value={estudianteData.contraseña}
                                onChange={handleEstudianteChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="cu">CU (Código Universitario)</label>
                            <input
                                type="text"
                                id="cu"
                                name="cu"
                                value={estudianteData.cu}
                                onChange={handleEstudianteChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="carrera">Carrera</label>
                            <select
                                id="carrera"
                                name="carrera"
                                value={estudianteData.carrera}
                                onChange={handleEstudianteChange}
                                required
                            >
                                <option value="">Selecciona tu carrera</option>
                                <option value="cico">Ingeniería en Ciencias de la Computación</option>
                                <option value="sis">Ingeniería de Sistemas</option>
                                <option value="ti">Ingeniería en TI y seguridad</option>
                                <option value="dad">Ingeniería en diseño y animación digital</option>
                            </select>
                        </div>
                    </>
                )}

                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrarse'}
                </button>
            </form>
        </div>
    );
};

export default SignUpForm;