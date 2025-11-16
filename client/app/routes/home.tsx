import type { Route } from "./+types/home";
import {FortuneWheel} from "~/wheel/Wheel";
import {useGetPrizes} from "~/api/prizes/prizes";
import {useGetMe} from "~/api/users/users";
import { useState, useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const {data, isLoading, error} = useGetPrizes();
  const {data: userData, isLoading: isLoadingUser, error: userError, refetch} = useGetMe();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (userData) {
      setBalance(userData.data.balance);
    }
  }, [userData]);

  const handleSpinCost = () => {
    setBalance(prev => prev - 100);
  };

  const handleSpinComplete = async () => {
    // После завершения прокрутки получаем актуальный баланс с сервера
    const result = await refetch();
    if (result.data) {
      setBalance(result.data.data.balance);
    }
  };

  if (isLoading || isLoadingUser) return <div className="flex items-center justify-center">Loading...</div>
  if (error || userError) return <div className="flex items-center justify-center">Ошибка загрузки данных</div>
  const prizes = data?.data || [];

  return <div className="flex items-center justify-center gap-8 p-8">
    <div className="w-[400px] bg-[#212121] p-6 rounded-lg shadow-lg">
      <div className="text-2xl font-bold mb-4 text-center">Колесо фортуны</div>

      <div className="mb-4 text-center">
        <div className="text-lg font-semibold">Ваш баланс:</div>
        <div className="text-3xl font-bold text-yellow-300">{balance} монет</div>
      </div>

      <div className="text-center text-sm mb-4">
        Стоимость прокрутки: <span className="font-bold">100 монет</span>
      </div>
    </div>
    <FortuneWheel prizes={prizes} balance={balance} onSpinCost={handleSpinCost} onSpinComplete={handleSpinComplete} />
  </div>
}
