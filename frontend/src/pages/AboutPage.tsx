import ImageSlot from "../components/common/ImageSlot";
import SectionHeader from "../components/common/SectionHeader";

const HISTORY = [
  { year: "1976", description: "종로구 배익로에서 작은 빵집으로 문을 열었습니다" },
  { year: "1998", description: "2대째 가업을 이어받아 카페 공간을 확장했습니다" },
  { year: "2015", description: "원두 로스팅을 직접 시작하며 커피 메뉴를 강화했습니다" },
  { year: "2024", description: "시즌 메뉴와 온라인 소식 채널을 새롭게 선보였습니다" },
];

const STORES = [
  { name: "배익거리 본점", address: "서울특별시 종로구 배익로 12길 34", hours: "매일 08:00 - 21:00" },
  { name: "배익거리 강남점", address: "서울특별시 강남구 테헤란로 123", hours: "매일 09:00 - 22:00" },
  { name: "배익거리 홍대점", address: "서울특별시 마포구 와우산로 45", hours: "매일 10:00 - 22:00" },
];

function AboutPage() {
  return (
    <div>
      <section className="bg-bg-warm px-4 py-10 md:px-8 lg:py-20">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-8 lg:flex-row lg:items-center">
          <ImageSlot
            src={null}
            alt="배익거리 매장 전경"
            className="h-[200px] w-full flex-shrink-0 md:h-[260px] lg:h-[420px] lg:w-1/2"
          />
          <div className="flex flex-col gap-4">
            <h1 className="font-display text-[32px] text-primary">정성을 담아 이어온 배익거리</h1>
            <p className="text-sm leading-relaxed text-primary">
              배익거리는 1976년 작은 동네 빵집에서 시작해 오늘까지 한결같은 정성으로 빵과 커피를 만들어 왔습니다.
              좋은 재료와 정직한 레시피를 지키며, 방문하는 모든 분들에게 편안한 쉼과 따뜻한 한 끼를 전하고자
              합니다.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-8 lg:py-16">
        <div className="mx-auto max-w-[1200px]">
          <SectionHeader title="연혁" />
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:flex-wrap md:gap-8">
            {HISTORY.map((item) => (
              <div key={item.year} className="flex flex-col gap-1 md:w-[calc(50%-16px)] lg:w-[calc(25%-24px)]">
                <span className="font-display text-2xl text-accent">{item.year}</span>
                <span className="text-sm text-primary">{item.description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg-warm px-4 py-10 md:px-8 lg:py-16">
        <div className="mx-auto max-w-[1200px]">
          <SectionHeader title="매장 안내" />
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {STORES.map((store) => (
              <div key={store.name} className="flex flex-col gap-1 bg-white p-5">
                <span className="font-bold text-primary">{store.name}</span>
                <span className="text-sm text-text-muted">{store.address}</span>
                <span className="hidden text-sm text-text-muted md:block">{store.hours}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
