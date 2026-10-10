const userService = require(
    "../services/user.service"
);

const {
    getCustomers,
    getCustomerById,
    updateCustomer,
    toggleCustomerStatus,
} = require(
    "../services/user.service"
);

const getCustomersController = async (
    req,
    res
) => {
    try {
        const {
            page,
            limit,
            search,
            isActive,
        } = req.query;

        let parsedIsActive;

        if (isActive !== undefined) {
            parsedIsActive =
                isActive === "true";
        }

        const result =
            await getCustomers({
                page,
                limit,
                search,
                isActive:
                    parsedIsActive,
            });

        return res.status(200).json({
            success: true,
            message:
                "Customers fetched successfully.",
            data: result,
        });
    } catch (error) {
        console.error(
            "Get customers controller error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch customers.",
        });
    }
};

const getCustomerController = async (
    req,
    res,
    next
) => {
    try {
        const customer =
            await getCustomerById(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            data: {
                customer,
            },
        });
    } catch (error) {
        next(error);
    }
};

/*
 * GET /api/users/me
 */
const getMe = async (
    req,
    res,
    next
) => {
    try {
        const user =
            await userService.getMe(
                req.user._id
            );

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/*
 * PATCH /api/users/me
 */
const updateMyProfile = async (
    req,
    res,
    next
) => {
    try {
        const user =
            await userService.updateMyProfile({
                userId: req.user._id,
                name: req.body.name,
                phone: req.body.phone,
            });

        return res.status(200).json({
            success: true,
            message:
                "Profile updated successfully.",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Update Customer - Admin
|--------------------------------------------------------------------------
*/

const updateCustomerController = async (
    req,
    res
) => {
    try {
        const {
            id,
        } = req.params;

        const {
            name,
            email,
            phone,
            password,
            isActive,
        } = req.body;

        const customer =
            await updateCustomer({
                customerId: id,
                name,
                email,
                phone,
                password,
                isActive,
            });

        return res.status(200).json({
            success: true,
            message: "Customer updated successfully.",
            data: {
                customer,
            },
        });
    } catch (error) {
        console.error(
            "Update customer controller error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Failed to update customer.",
        });
    }
};

const toggleCustomerStatusController =
    async (req, res) => {
        try {
            const {
                id,
            } = req.params;

            const customer =
                await toggleCustomerStatus(
                    id
                );

            return res.status(200).json({
                success: true,
                message: customer.isActive
                    ? "Customer activated successfully."
                    : "Customer deactivated successfully.",
                data: {
                    customer,
                },
            });
        } catch (error) {
            console.error(
                "Toggle customer status error:",
                error
            );

            return res.status(
                error.statusCode || 500
            ).json({
                success: false,
                message:
                    error.message ||
                    "Failed to update customer status.",
            });
        }
    };

module.exports = {
    getMe,
    updateMyProfile,
    getCustomerController,
    getCustomersController,
    updateCustomerController,
    toggleCustomerStatusController,
};