const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });

        if (!result.success) {
            const errors = result.error.issues.map(
                (issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })
            );

            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors,
            });
        }

        req.body = result.data.body;
        req.params = result.data.params;
        req.query = result.data.query;

        next();
    };
};

module.exports = { validate };