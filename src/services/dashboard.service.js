const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const getStartDate = (period) => {
    const now = new Date();

    switch (period) {
        case "30d": {
            const date = new Date(now);
            date.setDate(date.getDate() - 30);
            return date;
        }

        case "3m": {
            const date = new Date(now);
            date.setMonth(date.getMonth() - 3);
            return date;
        }

        case "1y": {
            const date = new Date(now);
            date.setFullYear(date.getFullYear() - 1);
            return date;
        }

        case "7d":
        default: {
            const date = new Date(now);
            date.setDate(date.getDate() - 7);
            return date;
        }
    }
};

const getPreviousPeriod = (startDate, endDate) => {
    const duration =
        endDate.getTime() - startDate.getTime();

    return {
        start: new Date(
            startDate.getTime() - duration
        ),
        end: new Date(startDate),
    };
};

const calculatePercentageChange = (
    current,
    previous
) => {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }

    return Number(
        (((current - previous) / previous) * 100).toFixed(1)
    );
};

const getDashboardData = async ({
    period = "7d",
}) => {
    const now = new Date();

    const startDate = getStartDate(period);

    const previousPeriod = getPreviousPeriod(
        startDate,
        now
    );

    /*
     * Revenue
     *
     * Only PAID orders are counted as revenue.
     */
    const revenueFilter = {
        createdAt: {
            $gte: startDate,
            $lte: now,
        },

        $or: [
            {
                paymentStatus: "PAID",
            },
            {
                orderStatus: "DELIVERED",
                paymentStatus: "PENDING",
            },
        ],
    };

    const previousRevenueFilter = {
        createdAt: {
            $gte: previousPeriod.start,
            $lt: previousPeriod.end,
        },

        $or: [
            {
                paymentStatus: "PAID",
            },
            {
                orderStatus: "DELIVERED",
                paymentStatus: "PENDING",
            },
        ],
    };

    /*
     * Current revenue
     */
    const currentRevenueResult =
        await Order.aggregate([
            {
                $match: revenueFilter,
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$totalAmount",
                    },
                },
            },
        ]);

    const previousRevenueResult =
        await Order.aggregate([
            {
                $match: previousRevenueFilter,
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$totalAmount",
                    },
                },
            },
        ]);

    const totalRevenue =
        currentRevenueResult[0]?.total || 0;

    const previousRevenue =
        previousRevenueResult[0]?.total || 0;

    /*
     * Orders
     */
    const totalOrders = await Order.countDocuments({
        createdAt: {
            $gte: startDate,
            $lte: now,
        },
    });

    const previousOrders =
        await Order.countDocuments({
            createdAt: {
                $gte: previousPeriod.start,
                $lt: previousPeriod.end,
            },
        });

    /*
     * Products
     */
    const totalProducts =
        await Product.countDocuments();

    const previousMonthStart = new Date(now);
    previousMonthStart.setMonth(
        previousMonthStart.getMonth() - 1
    );

    const previousMonthEnd = new Date(now);
    previousMonthEnd.setMonth(
        previousMonthEnd.getMonth() - 1
    );

    /*
     * Customers
     */
    const totalCustomers =
        await User.countDocuments({
            role: "USER",
        });

    const currentCustomers =
        await User.countDocuments({
            role: "USER",
            createdAt: {
                $gte: startDate,
                $lte: now,
            },
        });

    const previousCustomers =
        await User.countDocuments({
            role: "USER",
            createdAt: {
                $gte: previousPeriod.start,
                $lt: previousPeriod.end,
            },
        });

    /*
     * Sales chart
     */
    const sales = await getSalesChartData(
        startDate,
        now,
        period
    );

    /*
     * Recent orders
     */
    const recentOrders = await Order.find()
        .populate({
            path: "user",
            select: "name email phone",
        })
        .sort({
            createdAt: -1,
        })
        .limit(5)
        .lean();

    return {
        stats: {
            revenue: {
                value: Number(totalRevenue),
                change: calculatePercentageChange(
                    totalRevenue,
                    previousRevenue
                ),
            },

            orders: {
                value: totalOrders,
                change: calculatePercentageChange(
                    totalOrders,
                    previousOrders
                ),
            },

            products: {
                value: totalProducts,
                change: 0,
            },

            customers: {
                value: totalCustomers,
                change: calculatePercentageChange(
                    currentCustomers,
                    previousCustomers
                ),
            },
        },

        sales,

        recentOrders,
    };
};

const getSalesChartData = async (
    startDate,
    endDate,
    period
) => {
    const format =
        period === "1y"
            ? "%Y-%m"
            : "%Y-%m-%d";

    const result = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },

                $or: [
                    {
                        paymentStatus: "PAID",
                    },
                    {
                        orderStatus: "DELIVERED",
                        paymentStatus: "PENDING",
                    },
                ],
            },
        },

        {
            $group: {
                _id: {
                    $dateToString: {
                        format,
                        date: "$createdAt",
                    },
                },

                revenue: {
                    $sum: "$totalAmount",
                },

                orders: {
                    $sum: 1,
                },
            },
        },

        {
            $sort: {
                _id: 1,
            },
        },
    ]);

    return result.map((item) => ({
        date: item._id,
        revenue: Number(item.revenue || 0),
        orders: Number(item.orders || 0),
    }));
};

module.exports = {
    getDashboardData,
};