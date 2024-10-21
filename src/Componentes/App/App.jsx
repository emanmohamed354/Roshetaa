import React, { useContext } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import FetchCartProvider from '../../Context/Cart';
import { mediaContext } from '../../Context/MediaStore';
import ProductManager from '../LayOutComp/AdminPage/Admin';
import MedicalTests from '../LayOutComp/MedicalTests/MedicalTests';
import MedicalTourism from '../LayOutComp/medicaltourism/medicaltourism';
import Products from '../LayOutComp/Products/Products';
import WishList from '../LayOutComp/WishList/WishList';
import ForgetPassword from '../RegisterationComp/ForgetPassword/ForgetPassword';
import ProtectRouter from '../RegisterationComp/ProtectRouter/ProtectRouter';
import ResetPassword from '../RegisterationComp/ResetPassword/ResetPassword';
import SignUp from '../RegisterationComp/SignUp/SignUp';
import CartPage from './../LayOutComp/CartPage/CartPage';
import Home from './../LayOutComp/HomePage/Home';
import MasterLayOut from './../LayOutComp/MaterLayOut/MasterLayOut';
import Login from './../RegisterationComp/Login/Login';
import Alternative from '../LayOutComp/Alternative/AlternativesPage';
import Profile from '../LayOutComp/profile/profile'
import NotFound from './../LayOutComp/NotFound/NotFound';
import { ToastContainer } from 'react-toastify';
import ReverseProtectRouter from '../RegisterationComp/ReverseProtectRouter/ReverseProtect';
import Orders from '../LayOutComp/Orders/Order';
export default function App() {
  const { Role } = useContext(mediaContext);
  let routesConfig = [
    {
      path: '/',
      element: <MasterLayOut />,
      errorElement: <NotFound />,
      children: [
        { path: 'Products', element: <ProtectRouter><Products /></ProtectRouter> },
        { path: 'MedicalTests', element: <ProtectRouter><MedicalTests /></ProtectRouter> },
        { path: 'Cart', element: <ProtectRouter><CartPage /></ProtectRouter> },
        { path: 'WishList', element: <ProtectRouter><WishList /></ProtectRouter> },
        { path: 'MedicalTourism', element: <ProtectRouter><MedicalTourism /></ProtectRouter> },
        { path: 'Alternative', element: <ProtectRouter><Alternative /></ProtectRouter> },
        { path: 'Profile', element: <ProtectRouter><Profile /></ProtectRouter> },
        { path: 'Orders', element: <ProtectRouter><Orders /></ProtectRouter> },

        { path:"Login" ,element:<ReverseProtectRouter><Login /></ReverseProtectRouter>} ,
        { path: 'SignUp', element: <SignUp /> },
        { path: 'ForgetPassword', element: <ForgetPassword /> },
        { path: 'ResetPassword', element: <ResetPassword /> },
      ]
    }
  ];


  if (Role === 'admin') {
    routesConfig[0].children.push({
      index:true,
      element: <ProtectRouter><ProductManager /></ProtectRouter>
    });
  }else{
    routesConfig[0].children.push( { index: true, element: <ProtectRouter><Home /></ProtectRouter> });
  }

  const routes = createBrowserRouter(routesConfig);

  return (
    <>
    
      <FetchCartProvider>
        <ToastContainer theme='colored' />
        <RouterProvider router={routes} />
      </FetchCartProvider>
    </>
  );
}
