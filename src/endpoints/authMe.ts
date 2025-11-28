import type { Endpoint, PayloadRequest } from "payload";
import { authenticateMember } from "../lib/authMembers";

export const authMe: Endpoint = {
    path: "/auth/me",
    method: "get",
    handler: async (req: PayloadRequest) => {
        const pl = req.payload;

        // 1) اگر کاربر ادمین CMS باشد (users)
        if (req.user) {
            return Response.json({
                user: req.user,
                type: "admin",
            });
        }

        // 2) احراز هویت Member از طریق JWT
        const decoded = authenticateMember(req);

        if (decoded?.id) {
            const member = await pl.findByID({
                collection: "members",
                id: decoded.id,
            });

            if (member) {
                // فیلدهای حساس + غیرقابل استفاده را حذف کن
                const {
                    otp_code,
                    otp_expires,
                    // ❌ این دو فیلد در Member وجود ندارند، حذف شدند
                    // password,
                    // salt,
                    ...cleaned
                } = member;

                return Response.json({
                    user: cleaned,
                    type: "member",
                });
            }
        }

        // 3) اگر لاگین نشده است
        return Response.json({
            user: null,
            message: "Not authenticated",
        });
    },
};
