import Header from '@/components/layout/Patient/general/Header';
import SpecialityMenu from '@/components/layout/Patient/general/SpecialityMenu';
import TopDoctors from '@/components/layout/Patient/general/TopDoctors';
import Banner from '@/components/layout/Patient/general/Banner';

const Home = () => {
  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  );
};

export default Home;
