const advanceResults = (model, populate) => async (req, res, next) => {
    let query;
  //Copy req.query
  const reqQuery = { ...req.query };

  //Fields to exclude
  const removeField = ["select", "sort", "page", "limit"];

  //Loop over removeFields and delete them from reqQuery
  removeField.forEach((param) => delete reqQuery[param]);

//Create query string
  let queryStr = JSON.stringify(req.query);
  //Create operators($gt, $lt, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    match => `$${match}`
  );
//Finding the resources
  query = model.find(JSON.parse(queryStr));

  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  }else {
    query = query.sort("-salary")
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startindex = (page - 1) * limit;
  const endindex = page * limit;
  const total  = await model.countDocuments();
  query = query.skip(startindex).limit(limit);

  if(populate){
    query = query.populate(populate)
  }
  //Executing the query
  const results = await query

  //Pagination result
  const pagination = {};

  if(endindex < total) {
    pagination.next = {
      page: page + 1,
      limit
    }
  }

  if(startindex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    }
  }
  res.advanceResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  }
  next()
}

module.exports = advanceResults