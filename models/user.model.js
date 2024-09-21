const Users = [
  {
    id: 1,
    username: "Kirollos",
    password: "1234",
    createdAt: "created time",
  },
  {
    id: 2,
    username: "Kiro",
    password: "1234",
    createdAt: "created time",
  },
  {
    id: 3,
    username: "Samir",
    password: "1234",
    createdAt: "created time",
  },
  {
    id: 4,
    username: "Shenouda",
    password: "1234",
    createdAt: "created time",
  },
  {
    id: 5,
    username: "Henry",
    password: "1234",
    createdAt: "created time",
  },
  {
    id: 6,
    username: "Kirollos.samir",
    password: "1234",
    createdAt: "created time",
  },
  {
    id: 7,
    username: "Kiro.samir",
    password: "1234",
    createdAt: "created time",
  },
];

const userSchema = {
  id: "number",
  username: "string",
  password: "string",
  createdAt: "string",
  token: "string",
};

module.exports = {
  Users,
  userSchema,
};
