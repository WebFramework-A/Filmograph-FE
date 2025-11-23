import { useEffect, useRef, useState } from "react";

const ScrollReveal = ({
  children,
  direction = "up", // 디폴트 방향
  duration = "duration-2000", // 애니메이션 속도
  delay = "delay-0",
}: {
  children: React.ReactNode;
  direction?: "left" | "right" | "up";
  duration?: string;
  delay?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 화면에 30% 이상 보이면 애니메이션 실행
          if (entry.isIntersecting) {
            setIsVisible(true);

            // 한 번 실행되면 감시 중단 (다시 사라지지 않게끔)
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  // 방향별 시작 위치 스타일 설정
  const directionClasses = {
    up: "translate-y-20", // 아래 -> 위
    left: "-translate-x-20", // 왼쪽 -> 오른쪽
    right: "translate-x-20", // 오른쪽 -> 왼쪽
  };

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${duration} ${delay} transform ${
        isVisible
          ? "opacity-100 translate-x-0 translate-y-0" // 보일 때: 투명도 1, 제자리
          : `opacity-0 ${directionClasses[direction]}` // 안 보일 때: 투명도 0, 이동된 상태
      }`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
