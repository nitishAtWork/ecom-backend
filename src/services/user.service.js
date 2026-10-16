const User = require("../models/User");
const AppError = require("../utils/AppError");

const mongoose = require("mongoose");
const {
    hashPassword,
    comparePassword,
} = require("../utils/password");

/*
|--------------------------------------------------------------------------
| Update Customer
|--------------------------------------------------------------------------
*/

const updateCustomer = async ({
    customerId,
    name,
    email,
    phone,
    password,
    isActive,
}) => {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        const error = new Error("Invalid customer ID.");
        error.statusCode = 400;
        throw error;
    }

    const customer = await User.findOne({
        _id: customerId,
        role: "USER",
    });

    if (!customer) {
        const error = new Error("Customer not found.");
        error.statusCode = 404;
        throw error;
    }


    /*
    |--------------------------------------------------------------------------
    | Email
    |--------------------------------------------------------------------------
    */

    if (
        email &&
        email.toLowerCase() !== customer.email?.toLowerCase()
    ) {
        const existingUser = await User.findOne({
            email: email.toLowerCase(),
            _id: {
                $ne: customerId,
            },
        });

        if (existingUser) {
            const error = new Error(
                "A user already exists with this email."
            );

            error.statusCode = 409;

            throw error;
        }

        customer.email = email.toLowerCase();
    }


    /*
    |--------------------------------------------------------------------------
    | Name
    |--------------------------------------------------------------------------
    */

    if (name !== undefined) {
        customer.name = name.trim();
    }


    /*
    |--------------------------------------------------------------------------
    | Phone
    |--------------------------------------------------------------------------
    */

    if (phone !== undefined) {
        customer.phone = phone?.trim() || "";
    }


    /*
    |--------------------------------------------------------------------------
    | Active Status
    |--------------------------------------------------------------------------
    */

    if (isActive !== undefined) {
        customer.isActive = isActive;
    }


    /*
    |--------------------------------------------------------------------------
    | Password
    |--------------------------------------------------------------------------
    */

    if (
        password !== undefined &&
        password !== null &&
        password.trim() !== ""
    ) {
        customer.password = await hashPassword(
            password.trim()
        );
    }


    await customer.save();


    return {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: customer.role,
        isActive: customer.isActive,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
    };
};
/*
|--------------------------------------------------------------------------
| Update Role
|--------------------------------------------------------------------------
*/

const updateUserRole = async ({
    customerId,
    role,
}) => {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        const error = new Error("Invalid customer ID.");
        error.statusCode = 400;
        throw error;
    }

    const customer = await User.findOne({
        _id: customerId,
        role: role,
    });

    if (!customer) {
        const error = new Error("Customer not found.");
        error.statusCode = 404;
        throw error;
    }

    // toggle role between USER and ADMIN
    customer.role =
        customer.role === "USER" ? "ADMIN" : "USER";

    await customer.save();


    return {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: customer.role,
        isActive: customer.isActive,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
    };
};

/*
 * Get current user.
 */
const getMe = async (userId) => {
    const user =
        await User.findById(userId)
            .select(
                "-password -passwordResetVersion"
            )
            .lean();

    if (!user) {
        throw new AppError(
            "User not found.",
            404
        );
    }

    return user;
};

/*
 * Update current user's profile.
 */
const updateMyProfile = async ({
    userId,
    name,
    phone,
}) => {
    const user =
        await User.findById(userId);

    if (!user) {
        throw new AppError(
            "User not found.",
            404
        );
    }

    if (name !== undefined) {
        user.name = name;
    }

    if (phone !== undefined) {
        user.phone = phone;
    }

    await user.save();

    return await User.findById(userId)
        .select(
            "-password -passwordResetVersion"
        )
        .lean();
};

/*
 * Get customers for admin.
 *
 * Customers are normal users only.
 */
const getCustomers = async ({
    page = 1,
    limit = 20,
    search,
    isActive,
}) => {
    const skip = (page - 1) * limit;

    const filter = {
        role: "USER",
    };

    /*
    |--------------------------------------------------------------------------
    | Status Filter
    |--------------------------------------------------------------------------
    */

    if (isActive !== undefined) {
        filter.isActive = isActive;
    }

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    if (search) {
        filter.$or = [
            {
                name: {
                    $regex: search,
                    $options: "i",
                },
            },
            {
                email: {
                    $regex: search,
                    $options: "i",
                },
            },
            {
                phone: {
                    $regex: search,
                    $options: "i",
                },
            },
        ];
    }

    const [
        customers,
        total,
    ] = await Promise.all([
        User.find(filter)
            .select(
                "-password -otp -otpExpiry -__v"
            )
            .sort({
                createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

        User.countDocuments(filter),
    ]);

    return {
        customers,

        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(
                total / limit
            ),
        },
    };
};
/*
|--------------------------------------------------------------------------
| Get admins
|--------------------------------------------------------------------------
*/
const getAdminUser = async ({
    page = 1,
    limit = 20,
    search = "",
    isActive,
} = {}) => {
    const currentPage = Math.max(1, Number(page) || 1);
    const pageLimit = Math.max(1, Number(limit) || 20);
    const skip = (currentPage - 1) * pageLimit;

    const filter = {
        role: "ADMIN",
    };

    // Status filter
    if (isActive !== undefined && isActive !== "") {
        filter.isActive =
            typeof isActive === "boolean"
                ? isActive
                : isActive === "true";
    }

    // Search filter
    if (search && String(search).trim()) {
        const searchRegex = String(search).trim();

        filter.$or = [
            { name: { $regex: searchRegex, $options: "i" } },
            { email: { $regex: searchRegex, $options: "i" } },
            { phone: { $regex: searchRegex, $options: "i" } },
        ];
    }

    const [users, total] = await Promise.all([
        User.find(filter)
            .select("-password -otp -otpExpiry -__v")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageLimit)
            .lean(),

        User.countDocuments(filter),
    ]);

    return {
        users,
        pagination: {
            page: currentPage,
            limit: pageLimit,
            total,
            totalPages: Math.ceil(total / pageLimit),
        },
    };
};

const toggleCustomerStatus = async (
    customerId
) => {
    if (
        !mongoose.Types.ObjectId.isValid(
            customerId
        )
    ) {
        const error = new Error(
            "Invalid customer ID."
        );

        error.statusCode = 400;

        throw error;
    }

    const customer =
        await User.findOne({
            _id: customerId,
            role: "USER",
        });

    if (!customer) {
        const error = new Error(
            "Customer not found."
        );

        error.statusCode = 404;

        throw error;
    }

    customer.isActive =
        !customer.isActive;

    await customer.save();

    return {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        isActive: customer.isActive,
    };
};

const toggleAdminStatus = async (
    customerId
) => {
    if (
        !mongoose.Types.ObjectId.isValid(
            customerId
        )
    ) {
        const error = new Error(
            "Invalid customer ID."
        );

        error.statusCode = 400;

        throw error;
    }

    const customer =
        await User.findOne({
            _id: customerId,
            role: "ADMIN",
        });

    if (!customer) {
        const error = new Error(
            "Customer not found."
        );

        error.statusCode = 404;

        throw error;
    }

    customer.isActive =
        !customer.isActive;

    await customer.save();

    return {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        isActive: customer.isActive,
    };
};

/*
 * Get customer by ID.
 */
const getCustomerById = async (
    customerId
) => {
    const customer =
        await User.findOne({
            _id: customerId,
            // role: "USER",
        })
            .select(
                "-password -refreshToken -resetPasswordToken -resetPasswordExpires -emailVerificationToken"
            )
            .lean();

    if (!customer) {
        const error = new Error(
            "Customer not found."
        );

        error.statusCode = 404;

        throw error;
    }

    return customer;
};

module.exports = {
    getMe,
    updateMyProfile,
    getCustomers,
    getCustomerById,
    getCustomers,
    getCustomerById,
    updateCustomer,
    toggleCustomerStatus,
    toggleAdminStatus,
    getAdminUser,
    updateUserRole,
};