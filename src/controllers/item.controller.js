const Item = require('../models/item.model');

//Exposing data in mongoDB through API with pagination and sorting
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

//search API

exports.searchItems = async (req, res) => {
  try {
    const { title, category, pubDate } = req.query;

    // Step 1 - Build dynamic query
    const query = {};

    // If title provided → partial match (case insensitive)
    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }

    // If category provided → partial match (case insensitive)
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // If pubDate provided → find items on that date
    if (pubDate) {
      const startDate = new Date(pubDate);
      if (isNaN(startDate)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }
      const endDate = new Date(pubDate);
      endDate.setDate(endDate.getDate() + 1);

      query.pubDate = { $gte: startDate, $lt: endDate };
    }

    // Step 2 - Pagination
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    // Step 3 - Execute query
    const [items, total] = await Promise.all([
      Item.find(query)
        .sort({ pubDate: -1 })
        .skip(skip)
        .limit(limit),
      Item.countDocuments(query)
    ]);

    // Step 4 - Handle no results
    if (total === 0) {
      return res.status(200).json({
        success: true,
        message: 'No results found',
        pagination: { total: 0, page, limit, totalPages: 0 },
        data: [],
      });
    }

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
    console.error('searchItems error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};