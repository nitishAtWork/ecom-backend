const {
    getDashboardData,
} = require("../services/dashboard.service");

const getDashboardController = async (
    req,
    res,
    next
) => {
    try {
        const period = req.query.period || "7d";

        const data = await getDashboardData({
            period,
        });

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardController,
};