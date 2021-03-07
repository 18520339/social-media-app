const validator = require('validator').default;

exports.validateSignUp = (req, res, next) => {
    const { email, password, confirm, handle } = req.body;
    const errors = {};

    // Email
    if (!email) errors.email = 'Email is required';
    else if (!validator.isEmail(email)) errors.email = 'Email is invalid';

    // Password
    if (!password) errors.password = 'Password is required';
    else if (!validator.equals(password, confirm))
        errors.confirm = 'Password must match';

    // Confirm Password
    if (!confirm) errors.confirm = 'Confirm is required';
    else if (!validator.equals(password, confirm))
        errors.confirm = 'Password must match';

    // Handle
    if (!handle) errors.handle = 'Handle is required';

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);
    return next();
};

exports.validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = {};

    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);
    return next();
};
