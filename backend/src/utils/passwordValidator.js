const validatePassword = (password) => {
  if (!password) {
    return {
      valid: false,
      message: 'Password is required'
    };
  }

  if (password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long'
    };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUppercase) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }

  if (!hasLowercase) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }

  if (!hasNumber) {
    return {
      valid: false,
      message: 'Password must contain at least one number'
    };
  }

  if (!hasSpecialChar) {
    return {
      valid: false,
      message: 'Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)'
    };
  }

  return {
    valid: true,
    message: 'Password is valid'
  };
};

module.exports = { validatePassword };
