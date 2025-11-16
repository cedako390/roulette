import React, { useState } from "react";
import type {GetPrizes200Item} from "~/api/generated.schemas";
import { getTwist } from "~/api/prizes/prizes";

type WheelProps = {
  prizes: GetPrizes200Item[];
  balance: number;
  onSpinCost: () => void;
  onSpinComplete: () => void;
};

const SPIN_DURATION = 4000;
const FULL_SPINS = 5;
const SPIN_COST = 100;

export const FortuneWheel: React.FC<WheelProps> = ({ prizes, balance, onSpinCost, onSpinComplete }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [pickedPrize, setPickedPrize] = useState<GetPrizes200Item | null>(null);

  const segmentAngle = 360 / prizes.length;

  const getTargetRotation = (winnerIndex: number) => {
    // центр нужного сектора
    const prizeCenterAngle = winnerIndex * segmentAngle + segmentAngle / 2;
    const baseRotation = FULL_SPINS * 360;
    // стрелка сверху, а 0 градусов SVG — по оси X вправо,
    // поэтому смещаем на -90°, чтобы 0° оказался наверху
    return baseRotation - prizeCenterAngle - 90;
  };

  const handleSpin = async () => {
    if (isSpinning || prizes.length === 0 || pickedPrize !== null) return;

    // Проверка баланса
    if (balance < SPIN_COST) {
      alert(`Недостаточно монет! Для прокрутки нужно ${SPIN_COST} монет.`);
      return;
    }

    setIsSpinning(true);

    // Списываем монеты перед прокруткой
    onSpinCost();

    try {
      // Вызываем API для получения выигрышного приза
      const response = await getTwist();
      const winningPrize = response.data;

      // Находим индекс выигрышного приза в массиве
      const winnerIndex = prizes.findIndex(p => p.id === winningPrize.id);

      if (winnerIndex === -1) {
        console.error("Prize not found in the list");
        setIsSpinning(false);
        return;
      }

      const targetRotation = getTargetRotation(winnerIndex);
      const start = performance.now();
      const initialRotation = rotation;

      const animate = (time: number) => {
        const elapsed = time - start;
        const progress = Math.min(elapsed / SPIN_DURATION, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        const current =
          initialRotation + (targetRotation - initialRotation) * eased;

        setRotation(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsSpinning(false);
          setPickedPrize(prizes[winnerIndex]);
          // Обновляем баланс после выигрыша
          onSpinComplete();
        }
      };

      requestAnimationFrame(animate);
    } catch (error) {
      console.error("Error spinning the wheel:", error);
      setIsSpinning(false);
      // В случае ошибки возвращаем монеты обратно
      onSpinCost(); // вызовем еще раз, чтобы вернуть (можно передать отдельный колбэк для возврата)
    }
  };

  const closeModal = () => {
    setPickedPrize(null);
    setRotation(0);
  };

  // Функция генерации пути для сектора
  const createSlicePath = (index: number, radius: number, cx: number, cy: number) => {
    const startAngle = index * segmentAngle;
    const endAngle = startAngle + segmentAngle;

    const rad = (deg: number) => (deg * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(rad(startAngle));
    const y1 = cy + radius * Math.sin(rad(startAngle));
    const x2 = cx + radius * Math.cos(rad(endAngle));
    const y2 = cy + radius * Math.sin(rad(endAngle));

    const largeArcFlag = segmentAngle > 180 ? 1 : 0;

    // Путь "из центра -> точка начала дуги -> дуга -> центр"
    return [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");
  };

  const size = 390;
  const radius = size / 2 - 4; // -4 чтобы не заезжать на бордер
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        // margin: "0 auto",
      }}
    >
      {/* Стрелка */}
      <div
        style={{
          position: "absolute",
          top: -10,
          left: "50%",
          transform: "translateX(-50%) rotate(180deg)",
          width: 0,
          height: 0,
          borderLeft: "15px solid transparent",
          borderRight: "15px solid transparent",
          borderBottom: "30px solid red",
          zIndex: 2,
        }}
      ></div>

      {/* Колесо (SVG) */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <svg
          width={size}
          height={size}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? "none" : "transform 0.3s ease-out",
          }}
        >
          {/* Сектор + текст для каждого приза */}
          {prizes.map((prize, index) => {
            const isEven = index % 2 === 0;
            const backgroundColor = isEven ? "#000000" : "#ffeb3b";
            const textColor = isEven ? "#ffeb3b" : "#000000";

            const startAngle = index * segmentAngle;
            const centerAngle = startAngle + segmentAngle / 2;

            const rad = (deg: number) => (deg * Math.PI) / 180;

            // Позиция текста по радиусу (0.6–0.75 обычно смотрится хорошо)
            const textRadius = radius * 0.65;

            const textX = cx + textRadius * Math.cos(rad(centerAngle));
            const textY = cy + textRadius * Math.sin(rad(centerAngle));

            return (
              <g key={index}>
                {/* Сектор */}
                <path
                  d={createSlicePath(index, radius, cx, cy)}
                  fill={backgroundColor}
                  stroke="#333"
                  strokeWidth={1}
                />
                {/* Текст */}
                <text
                  x={textX}
                  y={textY}
                  fill={textColor}
                  fontSize={14}
                  fontWeight={600}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${centerAngle}, ${textX}, ${textY})`}
                  style={{
                    pointerEvents: "none",
                  }}
                >
                  {prize.text}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <button
        onClick={handleSpin}
        disabled={isSpinning || pickedPrize !== null}
        style={{
          margin: "20px auto",
          // marginTop: 20,
          display: "block",
          // width: "100%",
          padding: "12px 24px",
          borderRadius: "6px",
          background: "#ffeb3b",
          color: "#212121",
          fontWeight: "600"
      }}
      >
        {isSpinning ? "Крутим..." : "Крутить рулетку (100 рублей)"}
      </button>

      {/* Модалка с результатом */}
      {pickedPrize !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "24px 32px",
              borderRadius: 8,
              maxWidth: 360,
              textAlign: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              color: "#212121",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Ваш приз!</h2>
            <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
              {pickedPrize.text} ({pickedPrize.amount})
            </p>
            <button
              onClick={closeModal}
              style={{
                padding: "10px 20px",
                background: "#ffeb3b",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Ок
            </button>
          </div>
        </div>
      )}
    </div>
  );
};