const Address = require("../models/Address");

const createAddress = async ({
    userId,
    data,
}) => {
    /*
     * If this address should be default,
     * remove default from existing addresses.
     */

    if (data.isDefault) {
        await Address.updateMany(
            {
                user: userId,
                isDefault: true,
            },
            {
                $set: {
                    isDefault: false,
                },
            }
        );
    }

    /*
     * If this is the user's first address,
     * automatically make it default.
     */

    const addressCount =
        await Address.countDocuments({
            user: userId,
        });

    const isDefault =
        addressCount === 0
            ? true
            : data.isDefault;

    const address =
        await Address.create({
            user: userId,
            ...data,
            isDefault,
        });

    return address;
};

const getUserAddresses = async ({
    userId,
}) => {
    return Address.find({
        user: userId,
    })
        .sort({
            isDefault: -1,
            createdAt: -1,
        })
        .lean();
};

const getUserAddressById = async ({
    userId,
    addressId,
}) => {
    const address =
        await Address.findOne({
            _id: addressId,
            user: userId,
        }).lean();

    if (!address) {
        const error = new Error(
            "Address not found."
        );

        error.statusCode = 404;

        throw error;
    }

    return address;
};

const updateAddress = async ({
    userId,
    addressId,
    data,
}) => {
    const address =
        await Address.findOne({
            _id: addressId,
            user: userId,
        });

    if (!address) {
        const error = new Error(
            "Address not found."
        );

        error.statusCode = 404;

        throw error;
    }

    /*
     * If making this address default,
     * remove default from other addresses.
     */

    if (data.isDefault === true) {
        await Address.updateMany(
            {
                user: userId,
                _id: {
                    $ne: addressId,
                },
                isDefault: true,
            },
            {
                $set: {
                    isDefault: false,
                },
            }
        );
    }

    Object.assign(address, data);

    await address.save();

    return address;
};

const setDefaultAddress = async ({
    userId,
    addressId,
}) => {
    const address =
        await Address.findOne({
            _id: addressId,
            user: userId,
        });

    if (!address) {
        const error = new Error(
            "Address not found."
        );

        error.statusCode = 404;

        throw error;
    }

    /*
     * Remove default from all other
     * addresses of this user.
     */

    await Address.updateMany(
        {
            user: userId,
            _id: {
                $ne: addressId,
            },
        },
        {
            $set: {
                isDefault: false,
            },
        }
    );

    address.isDefault = true;

    await address.save();

    return address;
};

const deleteAddress = async ({
    userId,
    addressId,
}) => {
    const address =
        await Address.findOne({
            _id: addressId,
            user: userId,
        });

    if (!address) {
        const error = new Error(
            "Address not found."
        );

        error.statusCode = 404;

        throw error;
    }

    const wasDefault =
        address.isDefault;

    await address.deleteOne();

    /*
     * If the deleted address was the default,
     * assign another address as default.
     */

    if (wasDefault) {
        const nextAddress =
            await Address.findOne({
                user: userId,
            }).sort({
                createdAt: -1,
            });

        if (nextAddress) {
            nextAddress.isDefault = true;

            await nextAddress.save();
        }
    }

    return {
        deleted: true,
    };
};

module.exports = {
    createAddress,
    getUserAddresses,
    getUserAddressById,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
};