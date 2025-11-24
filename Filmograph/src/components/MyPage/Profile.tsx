import React from "react";

interface Props {
    userInfo: any;
    currentUser: any;
}

export default function Profile({ userInfo, currentUser }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="flex gap-6 items-center">
                <img
                    src={userInfo.photoURL || currentUser?.photoURL || "/default-avatar.png"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-[#FFD700] object-cover shadow-lg"
                />
                <div>
                    <h2 className="text-3xl font-bold mb-1">
                        {userInfo.nickname || currentUser?.displayName || "영화 팬"}
                    </h2>
                    <p className="text-[#FFD700] mb-2 opacity-80">
                        @{currentUser?.email?.split("@")[0]}
                    </p>
                    <span className="bg-[#F0E68C] text-black px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                        Level 1. 비기너
                    </span>
                </div>
            </div>

            <div className="bg-black/20 p-6 rounded-lg text-sm space-y-3 backdrop-blur-sm border border-white/5 shadow-md">
                <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/70">이메일</span>
                    <span>{currentUser?.email}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/70">가입일</span>
                    <span>
                        {userInfo.createdAt
                            ? new Date(userInfo.createdAt).toLocaleDateString()
                            : "-"}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-white/70">상태</span>
                    <span className="text-green-400 font-semibold">활동 중</span>
                </div>
            </div>
        </div>
    );
}