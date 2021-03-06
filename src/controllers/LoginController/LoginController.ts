import { IJwtParam, IPayload, ILoginController } from "../../_@types/Controllers";
import { ISignInInfomation, ISelectFromUser } from "../../_@types/Models/User";

import { Request, Response } from "express";

import jsonwebtoken, { SignOptions } from "jsonwebtoken";

import ResponseManager from "../util/ResponseManager";

import UserModel from "../../models/UserModel/UserModel";

export default class LoginController implements ILoginController {
  constructor() {
    this.userModel = new UserModel();
  }

  userModel: UserModel;

  postUser = async (req: Request, res: Response) => {
    const responseManager = new ResponseManager(res);

    const { id, pw }: ISignInInfomation = req.body;
    const selectedResult = await this.userModel.selectUser({ id });

    if (!selectedResult.isOk) {
      return responseManager.json(412, "계정을 찾을 수 없습니다.");
    }

    const userInfomations: ISelectFromUser[] = selectedResult.data;
    const userInfomation = userInfomations[0];

    const hasUserInfo = userInfomation !== undefined;
    const isMatchPw = userInfomation.mb_password !== pw;
    if (hasUserInfo && isMatchPw) {
      return responseManager.json(412, "아이디 또는 비밀번호가 틀렸습니다.");
    }

    const payload: IPayload = { id, level: userInfomation.mb_level };
    const { HOST, PORT, SECRET, EXPIREIN } = process.env as IJwtParam;
    const options: SignOptions = {
      issuer: `${HOST}:${PORT}`,
      expiresIn: EXPIREIN
    };

    const rawtoken = jsonwebtoken.sign(payload, SECRET, options);
    res.setHeader("x-access-token", rawtoken);

    responseManager.json(200, "로그인에 성공했습니다.");
  };
}
