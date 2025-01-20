import { Outlet } from 'react-router-dom';
import MainLayout from './MainLayout';
import FloatingIcon from '../FloatingIcon';

function RootLayout() {
  return (
    <MainLayout>
      <Outlet />
      <FloatingIcon />
    </MainLayout>
  );
}

export default RootLayout;
