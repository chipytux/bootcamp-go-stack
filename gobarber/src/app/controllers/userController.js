import User from '../models/User';

class UserController {
  async store(req, res) {
    const user = await User.create(req.body);
    return res.json(user);
  }

  async show(req, res) {
    const user = await User.findAll();
    return res.json(user);
  }
}

export default new UserController();
