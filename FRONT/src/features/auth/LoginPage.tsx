import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from './auth.service';
import { useAuthStore } from '../../store/auth.store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const result = await authService.login(data);
      setUser(result.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { message?: string };
      setServerError(e?.message || 'Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            id="email"
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            id="password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            error={errors.password?.message}
            rightIcon={
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="text-gray-500 text-xs">
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            }
          />
          {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
          <Button type="submit" loading={isSubmitting} className="w-full">
            Ingresar
          </Button>
        </form>
      </div>
    </div>
  );
}
