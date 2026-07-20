import { useState } from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getPopups } from "../../api/popups";

function hideKey(popupId: number) {
  return `popup-hide-until-${popupId}`;
}

function todayLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isHiddenToday(popupId: number): boolean {
  return localStorage.getItem(hideKey(popupId)) === todayLocal();
}

function hideUntilTomorrow(popupId: number) {
  localStorage.setItem(hideKey(popupId), todayLocal());
}

function PopupModal() {
  const { data: popups } = useQuery({ queryKey: ["popups"], queryFn: getPopups });
  const [dismissed, setDismissed] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  const popup = popups?.find((p) => !isHiddenToday(p.id));

  if (!popup || dismissed) return null;

  const close = () => {
    if (dontShowToday) hideUntilTomorrow(popup.id);
    setDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[400px] bg-white p-6">
        <h2 className="font-display text-xl text-primary">{popup.title}</h2>

        <p className="mt-4 whitespace-pre-wrap text-sm text-primary">{popup.content}</p>

        <div className="mt-6 flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
            />
            오늘 하루 보지 않기
          </label>
          <button aria-label="닫기" onClick={close}>
            <X size={20} className="text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PopupModal;
