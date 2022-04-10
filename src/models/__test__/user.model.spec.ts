import { User, IUser, IUserDoc, Role } from '../user.model';

const mockUser: IUser = {
  email: 'mock.user@mail.com',
  password: 'P4ssword',
  phone_number: '+33753933262',
  role: Role.PROVIDER,
};

describe('User model', () => {
  it.each`
    field             | value              | expectedMessage
    ${'email'}        | ${'invalid@email'} | ${'Not a valid e-mail address'}
    ${'phone_number'} | ${'123456789'}     | ${'Not a valid phone number'}
    ${'role'}         | ${'invalid_role'}  | ${'Not a valid role'}
  `('throws a validation error when $field is invalid', async ({ field, value, expectedMessage }) => {
    const user = User.build({ ...mockUser, [field]: value });

    await expect(() => user.save()).rejects.toThrow(`User validation failed: ${field}: ${expectedMessage}`);
  });

  it('saves user to database', async () => {
    const user = User.build(mockUser);
    await user.save();

    const users: IUserDoc[] = await User.find();
    expect(users.length).toBe(1);
  });

  it('hashes user password before saving it to database', async () => {
    const user = User.build(mockUser);
    await user.save();

    const users: IUserDoc[] = await User.find();
    expect(users[0].password).not.toEqual(mockUser.password);
  });

  it.each`
    value                | condition          | result
    ${mockUser.password} | ${'matches'}       | ${true}
    ${'randomPassword'}  | ${"doesn't match"} | ${false}
  `('returns $result when raw password $condition hashed password', async ({ value, result }) => {
    const user = User.build(mockUser);
    await user.save();

    const isCorrectPassword = await user.matchPassword(value);
    expect(isCorrectPassword).toBe(result);
  });
});
