import jwt  from "jsonwebtoken";
import { Types} from "mongoose";

type userPayload = {
    id: Types.ObjectId
}
export const generateJWT = (id : userPayload) => {

    return jwt.sign(id,process.env.JWT_SECRET,{expiresIn:'12h'})
}