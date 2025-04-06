import { Benefits } from './_components/Benefits'
import { Hero } from './_components/Hero'
import { SectionTitle } from './_components/SectionTitle'
import { benefitOne, benefitTwo } from './_components/data'
import { Cta } from './_components/Cta'

const HomePage = () => {
  return (
    <div>
      <Hero />
      <SectionTitle
        preTitle="Nextly Benefits"
        title=" Why should you use this landing page"
      >
        Nextly is a free landing page & marketing website template for startups
        and indie projects. Its built with Next.js & TailwindCSS. And its
        completely open-source.
      </SectionTitle>
      <Benefits data={benefitOne} />
      <Benefits imgPos="right" data={benefitTwo} />{' '}
      <SectionTitle
        preTitle="Watch a video"
        title="Learn how to fullfil your needs"
      >
        This section is to highlight a promo or demo video of your product.
        Analysts says a landing page with video has 3% more conversion rate. So,
        don&apos;t forget to add one. Just like this.
      </SectionTitle>
      <Cta />
    </div>
  )
}
export default HomePage
