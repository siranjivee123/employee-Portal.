exports.buildFilter = (query) => {
  let filter = {};

  if (query.status) filter.status = query.status;
  if (query.project) filter.project = query.project;
  if (query.employee) filter.employee = query.employee;

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } }
    ];
  }

  return filter;
};