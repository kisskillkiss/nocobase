import { Context, Next } from '@nocobase/actions';
import { PASSWORD } from '@nocobase/database';
import cryptoRandomString from 'crypto-random-string';

export async function check(ctx: Context, next: Next) {
  if (ctx.state.currentUser) {
    const user = ctx.state.currentUser.toJSON();
    ctx.body = user;
    await next();
  } else {
    ctx.throw(401, 'Unauthorized');
  }
}

export async function signin(ctx: Context, next: Next) {
  const { uniqueField = 'email', values } = ctx.action.params;
  console.log('signin.values', values);
  if (!values[uniqueField]) {
    ctx.throw(401, '请填写邮箱账号');
  }
  const User = ctx.db.getModel('users');
  const user = await User.scope('withPassword').findOne({
    where: {
      [uniqueField]: values[uniqueField],
    },
  });
  if (!user) {
    ctx.throw(401, '邮箱账号未注册');
  }
  const isValid = await PASSWORD.verify(values.password, user.password);
  if (!isValid) {
    ctx.throw(401, '密码错误，请您重新输入');
  }
  if (!user.token) {
    user.token = cryptoRandomString({ length: 20 });
    await user.save();
  }
  ctx.body = user.toJSON();
  delete ctx.body.password;
  await next();
}

export async function signout(ctx: Context, next: Next) {
  ctx.body = {};
  await next();
}

export async function signup(ctx: Context, next: Next) {
  const User = ctx.db.getModel('users');
  const { values } = ctx.action.params;
  try {
    const user = await User.create(values);
    ctx.body = user;
  } catch (error) {
    if (error.errors) {
      ctx.throw(401, error.errors.map((data) => data.message).join(', '));
    } else {
      ctx.throw(401, '注册失败');
    }
  }
  await next();
}

export async function lostpassword(ctx: Context, next: Next) {
  const {
    values: { email },
  } = ctx.action.params;
  if (!email) {
    ctx.throw(401, '请填写邮箱账号');
  }
  const User = ctx.db.getModel('users');
  const user = await User.findOne({
    where: {
      email,
    },
  });
  if (!user) {
    ctx.throw(401, '邮箱账号未注册');
  }
  user.reset_token = cryptoRandomString({ length: 20 });
  await user.save();
  ctx.body = user;
  await next();
}

export async function resetpassword(ctx: Context, next: Next) {
  const {
    values: { email, password, reset_token },
  } = ctx.action.params;
  const User = ctx.db.getModel('users');
  const user = await User.findOne({
    where: {
      email,
      reset_token,
    },
  });
  if (!user) {
    ctx.throw(401, 'Unauthorized');
  }
  user.token = null;
  user.reset_token = null;
  user.password = password;
  await user.save();
  ctx.body = user;
  await next();
}

export async function getUserByResetToken(ctx: Context, next: Next) {
  const { token } = ctx.action.params;
  const User = ctx.db.getModel('users');
  const user = await User.findOne({
    where: {
      reset_token: token,
    },
  });
  if (!user) {
    ctx.throw(401, 'Unauthorized');
  }
  ctx.body = user;
  await next();
}

export async function updateProfile(ctx: Context, next: Next) {
  const { values } = ctx.action.params;
  if (!ctx.state.currentUser) {
    ctx.throw(401, 'Unauthorized');
  }
  await ctx.state.currentUser.update(values);
  ctx.body = ctx.state.currentUser;
  await next();
}

export async function changePassword(ctx: Context, next: Next) {
  const {
    values: { oldPassword, newPassword },
  } = ctx.action.params;
  if (!ctx.state.currentUser) {
    ctx.throw(401, 'Unauthorized');
  }
  const User = ctx.db.getModel('users');
  const user = await User.scope('withPassword').findOne({
    where: {
      email: ctx.state.currentUser.email,
    },
  });
  const isValid = await PASSWORD.verify(oldPassword, user.password);
  if (!isValid) {
    ctx.throw(401, '密码错误，请您重新输入');
  }
  user.password = newPassword;
  user.save();
  ctx.body = ctx.state.currentUser.toJSON();
  await next();
}
