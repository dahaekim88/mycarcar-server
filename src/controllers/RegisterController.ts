import { selectUser, insertUser } from "../models/user/UserModel";
import { AsyncController } from "../_@types/Controllers";
import { IInsertForDB } from "../_@types/Models/User";

/** 회원가입 요청을 위한 컨트롤러. */
export const postRegister: AsyncController = async (req, res) => {
  const { name, id, pw, email, phone } = req.body as IInsertForDB;

  const userInfomations = await selectUser({ id });

  /** 같은 회원 정보가 없으므로 회원가입 조건 만족할 경우의 응답. */
  const hasNotUserInfomation = userInfomations[0] === undefined;
  if (hasNotUserInfomation) {
    await insertUser({ name, id, pw, email, phone });

    res.statusCode = 200;
    res.statusMessage =
      "[+] Membership registration has been carried out normally.";
    return res.end();
  }

  /** 이미 해당 아이디가 존재할 경우의 응답. */
  res.statusCode = 412;
  res.statusMessage = "[-] ID already exists.";
  res.end();
};
