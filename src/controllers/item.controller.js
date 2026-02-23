const Item = require('../models/item.model');

exports.getAllItems = async (req, res) => {
    try {
        //Extract page and limit from query parameters, with defaults
        let { page, limit } = req.query;

        //convert to integers and set defaults
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;

        //validate 
        if (page< 1) return res.status(400).json({ error: 'Page must be a positive integer' });
        if (limit < 1 || limit > 50) return res.status(400).json({ error: 'Limit must be between 1 and 50' });

        //calculate skip
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Item.find()
              .sort({ pubDate: -1 })
              .skip(skip)
              .limit(limit),
            Item.countDocuments()
        ]);

        //send response 
        res.status(200).json({
            success: true,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1,
    },
    data: items,
});
    } catch (err) {
        console.error('Error fetching items:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};