const { z } = require("zod");

const dashboardSchema = z.object({
    query: z.object({
        period: z
            .enum([
                "7d",
                "30d",
                "3m",
                "1y",
            ])
            .optional()
            .default("7d"),
    }),
});

module.exports = {
    dashboardSchema,
};