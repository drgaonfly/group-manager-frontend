import { Outlet } from 'react-router-dom';
import MainLayout from './MainLayout';

function RootLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export default RootLayout;
