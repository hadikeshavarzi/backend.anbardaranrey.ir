import jwt, { JwtPayload } from "jsonwebtoken";

export interface MemberToken extends JwtPayload {
    id: string | number;
    collection: "members";
    role?: string;
    email?: string;
}

export function authenticateMember(req: any): MemberToken | null {
    let authHeader: string | null = null;

    // --- Case 1: Fetch API style ---
    if (req.headers && typeof req.headers.get === "function") {
        authHeader = req.headers.get("authorization");
    }
    // --- Case 2: Node / Express style ---
    else if (req.headers) {
        authHeader =
            (req.headers["authorization"] as string | undefined) ||
            (req.headers["Authorization"] as string | undefined) ||
            null;
    }

    if (!authHeader || !authHeader.toString().startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.toString().slice(7).trim();

    try {
        const decoded = jwt.verify(
            token,
            process.env.PAYLOAD_SECRET as string
        ) as MemberToken;

        if (decoded.collection !== "members") {
            return null;
        }

        return decoded;
    } catch {
        return null;
    }
}
