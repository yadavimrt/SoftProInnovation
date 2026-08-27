import Header from '../../components/Header'
import Hero from '../../components/Hero'
import Swiper from '../../components/Swiper'
import FeaturedProducts from '../../components/FeaturedProducts'
import WhyChooseUs from '../../components/WhyChooseUs'
import Testimonials from '../../components/Testimonials'
import Newsletter from '../../components/Newsletter'
import Footer from '../../components/Footer'

const Home = () => {
  return (
    <div>
        <Header/>
        <Hero/>
        <Swiper/>
        <FeaturedProducts/>
        <WhyChooseUs/>
        <Testimonials/>
        <Newsletter/>
        <Footer/>
    </div>
  )
}

export default Home