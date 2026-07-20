import { useState } from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getPopups } from "../../api/popups";

function hideKey(popupId: number) {
  return `popup-hide-until-${popupId}`;
}

function isHiddenToday(popupId: number): boolean {
  const stored = localStorage.getItem(hideKey(popupId));
  const today = new Date().toISOString().slice(0, 10);
  return stored === today;
}

function hideUntilTomorrow(popupId: number) {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(hideKey(popupId), today);
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
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-xl text-primary">{popup.title}</h2>
          <button aria-label="닫기" onClick={close}>
            <X size={20} className="text-primary" />
          </button>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm text-primary">{popup.content}</p>

        <label className="mt-6 flex items-center gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            checked={dontShowToday}
            onChange={(e) => setDontShowToday(e.target.checked)}
          />
          오늘 하루 보지 않기
        </label>
      </div>
    </div>
  );
}

export default PopupModal;
