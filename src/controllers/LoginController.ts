import { Request, Response } from "express";
import UserModel from "../models/user/UserModel";
import jsonwebtoken, { SignOptions } from "jsonwebtoken";

export default class LoginController {
  /**
   * 로그인 요청.
   */
  public async postUserInfomation(req: Request, res: Response): Promise<void> {
    const userModel = new UserModel();

    const { id, pw } = req.body as ISignInInfomation;

    const userInfomations = (await userModel.getUser({
      id,
    })) as IRowDataPacket[];

    const userInfomation = userInfomations[0];

    /**
     * 회원 정보가 없을 경우의 응답.
     */
    const hasNotUserInfomations = userInfomation === undefined ? true : false;
    if (hasNotUserInfomations) {
      res.statusCode = 412;
      res.statusMessage = "[-] No matching information exists.";
      return res.end();
    }

    /**
     * 비밀번호가 맞지 않을 경우의 응답.
     */
    if (userInfomation.u_password !== pw) {
      res.statusCode = 412;
      res.statusMessage = "[-] No matching information exists.";
      return res.end();
    }

    const { HOST, PORT, SECRET, EXPIREIN } = process.env as IProcessEnv;

    const payload = { id } as object;
    const options = {
      issuer: `${HOST}:${PORT}`,
      expiresIn: EXPIREIN,
    } as SignOptions;

    /**
     * JWT 토큰 발행을 위한 응답.
     */
    const rawtoken = jsonwebtoken.sign(payload, SECRET, options) as string;
    res.setHeader("x-access-token", rawtoken);
    res.statusCode = 204;
    res.statusMessage = "[+] The token has been issued as normal.";
    res.end();
  }
}
