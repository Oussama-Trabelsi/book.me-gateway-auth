import { User, IUser, IUserDoc, role } from '../user.model';

const mockUser: IUser = {
  email: 'john.doe@gmail.com',
  password: 'P4ssword',
  who: role.PROVIDER,
};

describe('User model', () => {
  it('saves user to database', async () => {
    const user = User.build(mockUser);
    await user.save();

    const users: IUserDoc[] = await User.find();
    expect(users.length).toBe(1);
  });

  it('hashes user password before saving,it to database', async () => {
    const user = User.build(mockUser);
    await user.save();

    const users: IUserDoc[] = await User.find();
    expect(users[0].password).not.toEqual(mockUser.password);
  });

  it.each`
    value                | condition          | result
    ${mockUser.password} | ${'matches'}       | ${true}
    ${'randomPassword'}  | ${"doesn't match"} | ${false}
  `('returns $result if password $condition hashed password', async ({ value, result }) => {
    const user = User.build(mockUser);
    await user.save();

    const isCorrectPassword = await user.checkPassword(value);
    expect(isCorrectPassword).toBe(result);
  });
});
