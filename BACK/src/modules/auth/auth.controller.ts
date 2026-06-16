import { Request, Response } from 'express';
import { authService } from './auth.service';
import { successResponse } from '../../shared/utils/response.util';
import { env } from '../../config/env.config';

const isProduction = env.NODE_ENV === 'production';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
};

export class AuthController {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    res.status(201).json(successResponse(result, 'User registered successfully'));
  }

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    res
      .cookie('access_token', result.accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
      .cookie('refresh_token', result.refreshToken, {
        ...COOKIE_OPTS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json(successResponse(result.user, 'Login successful'));
  }

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.refresh_token;
    const result = await authService.refresh(token);
    res
      .cookie('access_token', result.accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
      .cookie('refresh_token', result.refreshToken, {
        ...COOKIE_OPTS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json(successResponse({}, 'Token refreshed'));
  }

  async logout(req: Request, res: Response) {
    const token = req.cookies?.refresh_token;
    if (token) await authService.logout(token);
    res.clearCookie('access_token').clearCookie('refresh_token').json(successResponse({}, 'Logged out'));
  }

  async me(req: Request, res: Response) {
    const result = await authService.me(req.user!.id);
    res.json(successResponse(result));
  }
}

export const authController = new AuthController();
