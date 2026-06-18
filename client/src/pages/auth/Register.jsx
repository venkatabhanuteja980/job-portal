import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import authApi from '../../api/authApi';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    try {
      setLoading(true);

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: 'candidate',
      };

      console.log('========== REGISTER REQUEST ==========');
      console.log('PAYLOAD:', payload);

      const response = await authApi.register(payload);

      console.log('========== REGISTER SUCCESS ==========');
      console.log(response);

      alert('Registration Successful!');
    } catch (err) {
  console.log("FULL ERROR OBJECT");
  console.dir(err);

  alert("Check Console");
}
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <Card
        title="Create Account"
        subtitle="Join Job Portal"
      >
        <div className="space-y-4">
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />

          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          <Button
            variant="primary"
            className="w-full"
            isLoading={loading}
            onClick={handleRegister}
          >
            Register
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-primary-600"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Register;