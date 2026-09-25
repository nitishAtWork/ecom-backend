const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );
};


const validatePassword = (password) => {

    if (
        typeof password !== "string" ||
        password.length < 8
    ) {
        return {
            valid: false,
            message:
                "Password must be at least 8 characters long.",
        };
    }

    if (!/[A-Z]/.test(password)) {
        return {
            valid: false,
            message:
                "Password must contain at least one uppercase letter.",
        };
    }

    if (!/[a-z]/.test(password)) {
        return {
            valid: false,
            message:
                "Password must contain at least one lowercase letter.",
        };
    }

    if (!/[0-9]/.test(password)) {
        return {
            valid: false,
            message:
                "Password must contain at least one number.",
        };
    }

    return {
        valid: true,
    };
};


module.exports = {
    isValidEmail,
    validatePassword,
};