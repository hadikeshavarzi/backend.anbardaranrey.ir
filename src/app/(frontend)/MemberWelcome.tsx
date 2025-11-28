"use client";

import React, { useEffect, useState } from "react";

export default function MemberWelcome() {
    const [member, setMember] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem("member");
        if (stored) {
            try {
                setMember(JSON.parse(stored));
            } catch (err) {
                console.error("Invalid member data in localStorage");
            }
        }
    }, []);

    if (!member) return null;

    return (
        <h1>Welcome back, {member.full_name || member.mobile}</h1>
    );
}
