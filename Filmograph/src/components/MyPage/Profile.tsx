import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
interface Props {
    userInfo: any;
    currentUser: any;
}

export default function Profile({ userInfo, currentUser }: Props) {
    // 수정 모드 상태
    const [isEditing, setIsEditing] = useState(false);
    // 입력된 새 닉네임 상태
    const [newNickname, setNewNickname] = useState("");
    // 화면에 보여줄 닉네임 상태 (DB 업데이트 후 즉시 반영용)
    const [displayNickname, setDisplayNickname] = useState("");

    // 초기 데이터 설정
    useEffect(() => {
        if (userInfo?.nickname) {
            setNewNickname(userInfo.nickname);
            setDisplayNickname(userInfo.nickname);
        } else if (currentUser?.displayName) {
            setNewNickname(currentUser.displayName);
            setDisplayNickname(currentUser.displayName);
        }
    }, [userInfo, currentUser]);

    // 프로필 업데이트 핸들러
    const handleUpdateProfile = async () => {
        if (!newNickname.trim()) {
            alert("닉네임을 입력해주세요.");
            return;
        }
        if (!currentUser) return;

        try {
            // Firestore 업데이트
            const userDocRef = doc(db, "users", currentUser.uid);
            await updateDoc(userDocRef, {
                nickname: newNickname
            });

            // UI 업데이트 및 모드 종료
            setDisplayNickname(newNickname);
            setIsEditing(false);
            alert("프로필이 수정되었습니다.");

        } catch (error) {
            console.error("프로필 업데이트 실패:", error);
            alert("프로필 수정 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="flex gap-6 items-center">
                <img
                    src={userInfo.photoURL || currentUser?.photoURL || "/default-avatar.png"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-[#FFD700] object-cover shadow-lg"
                />

                <div className="flex-1">
                    {/* 수정 모드에 따라 다른 UI 표시 */}
                    {isEditing ? (
                        <div className="flex flex-col gap-2 items-start">
                            <input
                                type="text"
                                value={newNickname}
                                onChange={(e) => setNewNickname(e.target.value)}
                                className="bg-white/10 border border-white/30 rounded px-3 py-2 text-white focus:outline-none focus:border-[#FFD700]"
                                placeholder="새 닉네임"
                                maxLength={10}
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleUpdateProfile}
                                    className="text-xs bg-[#FFD700] text-black px-3 py-1 rounded font-bold hover:bg-[#FFC107] transition-colors"
                                >
                                    저장
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setNewNickname(displayNickname); // 취소 시 원래 이름으로 복구
                                    }}
                                    className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-500 transition-colors"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl font-bold break-all"> {/* 닉네임이 너무 길면 줄바꿈 허용 */}
                                    {displayNickname || "영화 팬"}
                                </h2>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    //버튼 내 텍스트 줄바꿈 방지, 크기 축소 방지
                                    className="text-xs text-white/50 hover:text-[#FFD700] border border-white/20 px-2 py-1 rounded transition-colors whitespace-nowrap flex-shrink-0"
                                    title="닉네임 수정"
                                >
                                    수정
                                </button>
                            </div>

                            <p className="text-[#FFD700] mb-2 opacity-80">
                                @{currentUser?.email?.split("@")[0]}
                            </p>

                            {/*등급*/}
                            <span className="bg-[#F0E68C] text-black px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                Level 1. 비기너
                            </span>
                        </>
                    )}
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