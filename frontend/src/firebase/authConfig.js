import { getAuth } from "firebase/auth";
import { app } from "../utilis/firebase";

const auth = getAuth(app);
export default auth;
