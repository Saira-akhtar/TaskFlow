import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import { loginUser } from '../../services/authApi';
import useAuthStore from '../../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginUser({ email, password });

      if (response.token && response.user) {
        setCredentials(response.user, response.token);
      }

      navigate('/home');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Welcome Back
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Login to your TaskFlow account
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isLoading}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2 rounded border-gray-300" />
              <span className="text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;