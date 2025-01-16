import { Outlet } from 'react-router-dom';
import MainLayout from './MainLayout';
import FloatingImage from '../FloatingMessage';
import FloatingService from '../FloatingService';

function RootLayout() {
  return (
    <MainLayout>
      <Outlet />
      <FloatingImage />
      <FloatingService />
    </MainLayout>
  );
}

export default RootLayout;
