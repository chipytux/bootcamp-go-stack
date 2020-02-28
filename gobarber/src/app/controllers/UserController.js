import * as Yup from 'yup';

import User from '../models/User';
import File from '../models/File';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      password: Yup.string().required().min(6)
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validation Fails" })
    }

    const userExist = await User.findOne({ where: { email: req.body.email } });
    if (userExist) {
      return res.status(400).json({ error: 'User already exists.' });
    }
    const user = await User.create(req.body);
    return res.json(user);
  }

  async index(req, res) {
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findAll({
      limit,
      offset: (page - 1) * limit,
      attributes: ['id', 'name', 'email', 'provider'],
      include: [{
        model: File,
        as: 'avatar',
        attributes: ['id', 'url', 'path']
      }]
    });
    return res.json(user);
  }

  async update(req, res) {

    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPass, field) => oldPass ? field.required() : field),
      confirmPassword: Yup.string()
        .when('password', (pass, field) =>
          pass ? field.required().oneOf([Yup.ref('password')]) : field)
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validation Fails" })
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email && email !== user.email) {
      const userExist = await User.findOne({ where: { email } });
      if (userExist) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password doest not match' });
    }

    try {
      const { id, name, provider } = await user.update(req.body);
      return res.json({ id, name, email, provider });
    }
    catch (error) {
      return res.status(400).json(error)
    }
  }
}

export default new UserController();
