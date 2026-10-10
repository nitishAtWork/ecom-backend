const {
    createAddress: createAddressService,
    getUserAddresses: getUserAddressesService,
    getUserAddressById: getUserAddressByIdService,
    updateAddress: updateAddressService,
    setDefaultAddress: setDefaultAddressService,
    deleteAddress: deleteAddressService,
} = require("../services/address.service");

const createAddress = async (
    req,
    res,
    next
) => {
    try {
        const address =
            await createAddressService({
                userId: req.user._id,
                data: req.body,
            });

        return res.status(201).json({
            success: true,
            message:
                "Address added successfully.",
            data: address,
        });
    } catch (error) {
        next(error);
    }
};

const getUserAddresses = async (
    req,
    res,
    next
) => {
    try {
        const addresses =
            await getUserAddressesService({
                userId: req.user._id,
            });

        return res.status(200).json({
            success: true,
            data: addresses,
        });
    } catch (error) {
        next(error);
    }
};

const getUserAddressById = async (
    req,
    res,
    next
) => {
    try {
        const address =
            await getUserAddressByIdService({
                userId: req.user._id,
                addressId: req.params.addressId,
            });

        return res.status(200).json({
            success: true,
            data: address,
        });
    } catch (error) {
        next(error);
    }
};

const updateAddress = async (
    req,
    res,
    next
) => {
    try {
        const address =
            await updateAddressService({
                userId: req.user._id,
                addressId: req.params.addressId,
                data: req.body,
            });

        return res.status(200).json({
            success: true,
            message:
                "Address updated successfully.",
            data: address,
        });
    } catch (error) {
        next(error);
    }
};

const setDefaultAddress = async (
    req,
    res,
    next
) => {
    try {
        const address =
            await setDefaultAddressService({
                userId: req.user._id,
                addressId: req.params.addressId,
            });

        return res.status(200).json({
            success: true,
            message:
                "Default address updated successfully.",
            data: address,
        });
    } catch (error) {
        next(error);
    }
};

const deleteAddress = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await deleteAddressService({
                userId: req.user._id,
                addressId: req.params.addressId,
            });

        return res.status(200).json({
            success: true,
            message:
                "Address deleted successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAddress,
    getUserAddresses,
    getUserAddressById,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
};