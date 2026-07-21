import os

from dotenv import load_dotenv
from google import genai

from app.exceptions import AppError

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-2.5-flash"


def generate_notice_draft(title: str) -> str:
    if not GEMINI_API_KEY:
        raise AppError(502, "AI_SERVICE_ERROR", "AI 초안 생성 기능을 사용할 수 없습니다")

    client = genai.Client(api_key=GEMINI_API_KEY)

    prompt = (
        "너는 베이커리카페 '배익거리'의 공지사항 작성을 돕는 어시스턴트야. "
        f"아래 제목에 어울리는 공지사항 본문 초안을 한국어로 작성해줘. "
        "정중하고 간결한 문체를 사용하고, 본문만 출력해.\n\n"
        f"제목: {title}"
    )

    try:
        response = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
    except Exception as error:
        raise AppError(502, "AI_SERVICE_ERROR", "AI 초안 생성에 실패했습니다") from error

    if not response.text:
        raise AppError(502, "AI_SERVICE_ERROR", "AI 초안 생성에 실패했습니다")

    return response.text
