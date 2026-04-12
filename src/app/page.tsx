import type { Metadata } from "next"
import Link from "next/link"

const pageTitle = "TOP"

export const metadata: Metadata = {
  title: `${pageTitle} | Hopexon Portfolio`,
  description: `${pageTitle} page of Hopexon Portfolio`,
};

const topMenuList = [
  { name: "Tools", path: "/tools" },
  { name: "Tips", path: "/tips" },
  { name: "Music Review", path: "https://hpx-pfproject02.vercel.app/music-review/" },
  { name: "Works", path: "/works" },
  { name: "Collections", path: "/collections" },
]

export default function Home() {
  return (
    <div>
      <h1 className='page__ttl'>{pageTitle}</h1>
      <div className="main__wrap">
        <section className="section__wrapper">
          <div className="linkitem__wrap space-y-10">
            {topMenuList.map((item) => (
              <Link key={item.name} href={item.path} className="link__twister w-fit font-bold">
                {item.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
