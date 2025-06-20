import axios from 'axios';

export const registerUser = async (formData) => {
  const res = await axios.post('http://192.168.1.172:3000/api/auth/register', {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    password: formData.password,
    confirmPassword: formData.confirmPassword,
    role: formData.selectRole.toLowerCase(),
    ...(formData.selectRole === 'Student' && { matricule: formData.matricule }),
    matriNumber: formData.matricule,
  });
  return res.data;
};