// Controller to handle fetching all events
const getAllEvents = (req, res) => {
  res.json({ message: 'Here are all the events!' });
};

module.exports = { getAllEvents };
