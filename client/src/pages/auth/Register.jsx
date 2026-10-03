import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { registerUser } from '../../services/authApi';
import useAuthStore from '../../store/authStore';

const Register = () => {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, ...dataToSend } = formData;
      const response = await registerUser(dataToSend);

      if (response.token && response.user) {
        setCredentials(response.user, response.token);
      }

      navigate('/home'); 
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Create Account
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Join TaskFlow to manage your projects
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
            disabled={isLoading}
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            required
            disabled={isLoading}
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            required
            disabled={isLoading}
          />

          <label className="flex items-start text-sm">
            <input
              type="checkbox"
              className="mr-2 mt-1 rounded border-gray-300"
              required
              disabled={isLoading}
            />
            <span className="text-gray-600">
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;